import { env } from '$env/dynamic/public';
import type { VoterCardDetailRow } from '$lib/server/utils/voter-card';
import { type Template, BLANK_A4_PDF } from '@pdfme/common';
import { generate } from '@pdfme/generator';
import { barcodes, image, text } from '@pdfme/schemas';
import type { AggregatedContestDetails } from './voter-card';

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
					position: { x: pageSpacings.header.voterInfoSection.leftMargin, y: 50 },
					width: 200,
					height: 32,
					fontSize: 12,
					fontFamily: 'Helvetica'
				},
				{
					name: 'voter_city_state',
					type: 'text',
					position: { x: pageSpacings.header.voterInfoSection.leftMargin, y: 55 },
					width: 200,
					height: 32,
					fontSize: 12,
					fontFamily: 'Helvetica'
				},
				{
					name: 'voter_zip_code',
					type: 'text',
					position: { x: pageSpacings.header.voterInfoSection.leftMargin, y: 60 },
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

	private aggregatedContestDetails: AggregatedContestDetails[];

	constructor(voterCardDetails: VoterCardDetailRow, contestDetails: AggregatedContestDetails[]) {
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

		this.aggregatedContestDetails = contestDetails;
	}

	async generatePdf() {
		const plugIns = {
			Text: text,
			'QR Code': barcodes.qrcode,
			Image: image
		};

		const basedDomain = env.PUBLIC_BASE_VOTER_DOMAIN;
		const computedUrl = `${basedDomain}/voter/start/?c=${this.voterCardCode}`;
		console.log('Generating voter card with URL:', computedUrl);
		const baseInputs = [
			{
				qr_scan_code: computedUrl,
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

		const { inputs, firstPageSchemas, continuationPageSchemas } =
			this.generateContestData(baseInputs);
		const staticFirstPageSchemas = this.template.schemas[0].filter(
			(schema) => !String(schema.name).startsWith('contest_')
		);
		const templateForGeneration: Template = {
			...this.template,
			schemas: [[...staticFirstPageSchemas, ...firstPageSchemas], ...continuationPageSchemas]
		};

		const pdf = await generate({
			template: templateForGeneration,
			inputs: inputs,
			plugins: plugIns
		});
		const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
		window.open(URL.createObjectURL(blob));
	}

	private generateContestData(baseInputs: Array<Record<string, string>>): {
		inputs: Array<Record<string, string>>;
		firstPageSchemas: Array<{
			[x: string]: unknown;
			name: string;
			type: string;
			position: { x: number; y: number };
			width: number;
			height: number;
		}>;
		continuationPageSchemas: Array<
			Array<{
				[x: string]: unknown;
				name: string;
				type: string;
				position: { x: number; y: number };
				width: number;
				height: number;
			}>
		>;
	} {
		const groupedContests = new Map<
			string,
			{
				title: string;
				description: string | null;
				items: Array<{ title: string; auxiliaryText: string | null }>;
			}
		>();

		for (const row of this.aggregatedContestDetails) {
			const existing = groupedContests.get(row.id);

			if (!existing) {
				groupedContests.set(row.id, {
					title: row.title,
					description: row.description,
					items:
						row.contestItemTitle || row.contestItemAuxiliaryText
							? [
									{
										title: row.contestItemTitle ?? 'Untitled option',
										auxiliaryText: row.contestItemAuxiliaryText
									}
								]
							: []
				});
				continue;
			}

			if (row.contestItemTitle || row.contestItemAuxiliaryText) {
				existing.items.push({
					title: row.contestItemTitle ?? 'Untitled option',
					auxiliaryText: row.contestItemAuxiliaryText
				});
			}
		}

		type TextSchema = {
			[x: string]: unknown;
			name: string;
			type: string;
			position: { x: number; y: number };
			width: number;
			height: number;
		};

		const firstPageSchemas: TextSchema[] = [];
		const continuationPageSchemas: TextSchema[][] = [];

		const contestInputs: Record<string, string> = {};
		let activePageSchemas = firstPageSchemas;
		let yPosition = 140;
		let continuationPageIndex = 0;

		const maxYByPage = (pageIndex: number) => (pageIndex === 0 ? 275 : 280);
		let currentPageIndex = 0;

		const addContinuationPage = () => {
			continuationPageIndex += 1;
			currentPageIndex += 1;

			const pageSchemas: TextSchema[] = [];
			continuationPageSchemas.push(pageSchemas);
			activePageSchemas = pageSchemas;

			const continuedHeaderKey = `contest_continued_header_${continuationPageIndex}`;
			const continuedElectionKey = `contest_continued_election_${continuationPageIndex}`;

			contestInputs[continuedHeaderKey] = 'YOUR DECISION, YOUR VOTE (CONTINUED)';
			contestInputs[continuedElectionKey] = this.electionName.toLocaleUpperCase();

			pageSchemas.push({
				name: continuedHeaderKey,
				type: 'text',
				position: { x: pageSpacings.header.voterInfoSection.leftMargin + 5, y: 15 },
				width: 300,
				height: 12,
				fontSize: 18,
				fontFamily: 'Helvetica-Bold'
			});

			pageSchemas.push({
				name: continuedElectionKey,
				type: 'text',
				position: { x: pageSpacings.sections.leftMargin - 20, y: 24 },
				width: 300,
				height: 12,
				fontSize: 12,
				fontFamily: 'Helvetica-Bold'
			});

			yPosition = 38;
		};

		const ensureSpace = (rowHeight: number) => {
			if (yPosition + rowHeight > maxYByPage(currentPageIndex)) {
				addContinuationPage();
			}
		};

		const contests = Array.from(groupedContests.values());
		if (!contests.length) {
			const noContestKey = 'contest_empty_state';
			contestInputs[noContestKey] = 'No eligible contests found for this voter card.';
			firstPageSchemas.push({
				name: noContestKey,
				type: 'text',
				position: { x: pageSpacings.sections.leftMargin - 20, y: yPosition },
				width: 400,
				height: 10,
				fontSize: 11,
				fontFamily: 'Helvetica-Oblique'
			});
		}

		for (let contestIndex = 0; contestIndex < contests.length; contestIndex += 1) {
			ensureSpace(7);

			const contest = contests[contestIndex];
			const contestKey = `contest_title_${contestIndex}`;
			contestInputs[contestKey] = `${contestIndex + 1}. ${contest.title}`;

			activePageSchemas.push({
				name: contestKey,
				type: 'text',
				position: { x: pageSpacings.sections.leftMargin - 20, y: yPosition },
				width: 430,
				height: 10,
				fontSize: 12,
				fontFamily: 'Helvetica-Bold'
			});

			yPosition += 7;

			if (contest.description) {
				ensureSpace(6);

				const descriptionKey = `contest_description_${contestIndex}`;
				contestInputs[descriptionKey] = contest.description;
				activePageSchemas.push({
					name: descriptionKey,
					type: 'text',
					position: { x: pageSpacings.sections.leftMargin - 14, y: yPosition },
					width: 430,
					height: 10,
					fontSize: 9,
					fontFamily: 'Helvetica-Oblique'
				});
				yPosition += 6;
			}

			if (!contest.items.length) {
				ensureSpace(6);

				const noItemKey = `contest_no_items_${contestIndex}`;
				contestInputs[noItemKey] = '• No contest items available';
				activePageSchemas.push({
					name: noItemKey,
					type: 'text',
					position: { x: pageSpacings.sections.leftMargin - 10, y: yPosition },
					width: 420,
					height: 10,
					fontSize: 10,
					fontFamily: 'Helvetica'
				});
				yPosition += 6;
			}

			for (let itemIndex = 0; itemIndex < contest.items.length; itemIndex += 1) {
				ensureSpace(6);

				const item = contest.items[itemIndex];
				const itemKey = `contest_item_${contestIndex}_${itemIndex}`;
				const itemText = item.auxiliaryText
					? `• ${item.title} (${item.auxiliaryText})`
					: `• ${item.title}`;

				contestInputs[itemKey] = itemText;
				activePageSchemas.push({
					name: itemKey,
					type: 'text',
					position: { x: pageSpacings.sections.leftMargin - 10, y: yPosition },
					width: 420,
					height: 10,
					fontSize: 10,
					fontFamily: 'Helvetica'
				});
				yPosition += 6;
			}

			yPosition += 4;
		}

		return {
			inputs: [{ ...baseInputs[0], ...contestInputs }],
			firstPageSchemas,
			continuationPageSchemas
		};
	}
}
