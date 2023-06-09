import { Configuration, OpenAIApi } from 'openai'
import QRCode from 'qrcode'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import * as fs from 'fs'

const OpenAIConfig = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
	organization: 'org-GYxW6eFmoMEuKEaHOYbnfZr4'
})

const openai = new OpenAIApi(OpenAIConfig)

const parser = yargs(hideBin(process.argv)).options({
	// prompt: { type: 'string', demandOption: true, alias: 'p' },
	light: {
		type: 'string',
		default: '#ffffff',
		description: 'Hex code for light color'
	},
	dark: {
		type: 'string',
		default: '#000000',
		description: 'Hex code for dark color'
	},
	margin: {
		type: 'number',
		default: 0,
		description: 'Margin around QR code'
	},
	size: {
		type: 'string',
		choices: ['256x256', '512x512', '1024x1024'] as const,
		description: 'Size of QR code',
		demandOption: true
	}
})

const main = async () => {
	const args = await parser.argv

	const width = Number(args.size.split('x'))

	await QRCode.toFile('code.png', args._[0].toString(), {
		type: 'png',
		margin: 0,
		color: {
			light: args.light,
			dark: args.dark
		},
		width: width
	})

	const codeFile = new File(
		[await fs.promises.readFile('code.png')],
		'code.png'
	)

	const res = await openai.createImageVariation(codeFile, 1, args.size)

	const image = await (await fetch(`${res.data.data[0].url}`)).blob()
	await fs.promises.writeFile('code.png', await image.arrayBuffer())
}

main()
