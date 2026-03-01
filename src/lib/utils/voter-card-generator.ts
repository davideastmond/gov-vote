import type { VoterCardDetailRow } from '$lib/server/utils/voter-card';
import { type Template, BLANK_A4_PDF } from '@pdfme/common';
import { generate } from '@pdfme/generator';
import { barcodes, image, text } from '@pdfme/schemas';

const pageSpacings = {
	sections: {
		leftMargin: 100
	},
	header: {
		voterCardTitle: {},
		qrCode: {},
		voterInfoSection: {
			leftMargin: 80
		}
	}
};
export class VoterCardGenerator {
	private template: Template = {
		basePdf: BLANK_A4_PDF,

		schemas: [
			[
				{
					name: 'voterCardTitleHeader',
					type: 'text',
					position: { x: pageSpacings.sections.leftMargin + 20, y: 10 },
					width: 100,
					height: 50,
					fontSize: 24,
					fontFamily: 'Helvetica-Bold'
				},
				{
					name: 'yourPollingStation',
					type: 'text',
					position: { x: pageSpacings.sections.leftMargin, y: 80 },
					width: 100,
					height: 50,
					fontSize: 24,
					fontFamily: 'Helvetica-Bold'
				},
				{
					name: 'qr_scan_code',
					type: 'qrcode',
					position: { x: 20, y: 20 },
					width: 50,
					height: 50
				},
				{
					name: 'toElector',
					type: 'text',
					position: { x: pageSpacings.header.voterInfoSection.leftMargin, y: 20 },
					width: 40,
					height: 12,
					fontSize: 12,
					fontFamily: 'Helvetica-Bold'
				},
				{
					name: 'voter_name',
					type: 'text',
					position: { x: pageSpacings.header.voterInfoSection.leftMargin, y: 25 },
					width: 100,
					height: 32,
					fontSize: 32,
					fontFamily: 'Helvetica-Bold'
				},
				{
					name: 'voter_street_address',
					type: 'text',
					position: { x: pageSpacings.header.voterInfoSection.leftMargin, y: 40 },
					width: 200,
					height: 32,
					fontSize: 12,
					fontFamily: 'Helvetica'
				},
				{
					name: 'voter_city_state',
					type: 'text',
					position: { x: pageSpacings.header.voterInfoSection.leftMargin, y: 45 },
					width: 200,
					height: 32,
					fontSize: 12,
					fontFamily: 'Helvetica'
				},
				{
					name: 'voter_zip_code',
					type: 'text',
					position: { x: pageSpacings.header.voterInfoSection.leftMargin, y: 50 },
					width: 200,
					height: 32,
					fontSize: 12,
					fontFamily: 'Helvetica'
				},
				{
					name: 'polling_station_name',
					type: 'text',
					position: { x: pageSpacings.sections.leftMargin - 20, y: 90 },

					width: 300,
					height: 32,
					fontSize: 14,
					fontFamily: 'Helvetica-Bold'
				},
				{
					name: 'polling_station_street',
					type: 'text',
					position: { x: pageSpacings.sections.leftMargin - 20, y: 95 },
					width: 300,
					height: 32,
					fontSize: 12,
					fontFamily: 'Helvetica-Bold'
				},
				{
					name: 'polling_station_city_state',
					type: 'text',
					position: { x: pageSpacings.sections.leftMargin - 20, y: 100 },
					width: 300,
					height: 32,
					fontSize: 12,
					fontFamily: 'Helvetica-Bold'
				},
				{
					name: 'polling_station_zip',
					type: 'text',
					position: { x: pageSpacings.sections.leftMargin - 20, y: 105 },
					width: 300,
					height: 32,
					fontSize: 12,
					fontFamily: 'Helvetica-Bold'
				},
				{
					name: 'yourDecision',
					type: 'text',
					position: { x: pageSpacings.header.voterInfoSection.leftMargin + 5, y: 120 },
					width: 300,
					height: 12,
					fontSize: 24,
					fontFamily: 'Helvetica-Bold'
				},
				{
					name: 'election_name',
					type: 'text',
					position: { x: pageSpacings.sections.leftMargin - 20, y: 130 },
					width: 300,
					height: 32,
					fontSize: 14,
					fontFamily: 'Helvetica-Bold'
				}
			]
		]
	};

	private electionName: string;
	private voterCardCode: string;
	private voterFirstName: string;
	private voterLastName: string;

	private voterStreetAddress: string;
	private voterCityState: string;
	private voterZipCode: string;

	private pollingStationName: string;
	private pollingStationStreet: string;
	private pollingStationCityState: string;
	private pollingStationZip: string;

	constructor(voterCardDetails: VoterCardDetailRow) {
		this.electionName = voterCardDetails.contestGroupName;
		this.voterCardCode = voterCardDetails.cardNumber;
		this.voterFirstName = voterCardDetails.firstName;
		this.voterLastName = voterCardDetails.lastName;
		this.voterStreetAddress = voterCardDetails.streetAddress || 'No specified address';
		this.voterCityState =
			[voterCardDetails.city, voterCardDetails.state].filter(Boolean).join(', ') ||
			'No specified city/state';
		this.voterZipCode = voterCardDetails.zipCode || 'No specified zip code';

		/* */
		this.pollingStationName = voterCardDetails.pollingStationName;
		this.pollingStationStreet = voterCardDetails.pollingStationStreet;
		this.pollingStationCityState =
			[voterCardDetails.pollingStationCity, voterCardDetails.pollingStationState]
				.filter(Boolean)
				.join(', ') || 'No specified city/state';
		this.pollingStationZip = voterCardDetails.pollingStationZip;
	}

	async generatePdf() {
		const plugIns = {
			Text: text,
			'QR Code': barcodes.qrcode,
			Image: image
		};
		const inputs = [
			{
				qr_scan_code: this.voterCardCode,
				voter_name: `${this.voterFirstName} ${this.voterLastName}`.toLocaleUpperCase(),
				voter_street_address: this.voterStreetAddress,
				voter_city_state: this.voterCityState,
				voter_zip_code: this.voterZipCode,
				election_name: this.electionName.toLocaleUpperCase(),
				polling_station_name: this.pollingStationName.toLocaleUpperCase(),
				polling_station_street: this.pollingStationStreet,
				polling_station_city_state: this.pollingStationCityState,
				polling_station_zip: this.pollingStationZip,
				toElector: 'To the elector:',
				voterCardTitleHeader: 'YOUR VOTER CARD',
				yourPollingStation: 'YOUR POLLING STATION',
				yourDecision: 'YOUR DECISION, YOUR VOTE'
			}
		];
		const pdf = await generate({ template: this.template, inputs: inputs, plugins: plugIns });
		const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
		window.open(URL.createObjectURL(blob));
	}
}
