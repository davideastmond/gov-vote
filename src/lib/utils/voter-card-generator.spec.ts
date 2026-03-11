import type { VoterCardDetailRow } from '$lib/server/utils/voter-card';
import { describe, expect, it } from 'vitest';
import type { AggregatedContestDetails } from './voter-card';
import { VoterCardGenerator } from './voter-card-generator';

type TextSchema = {
	name: string;
	type: string;
	position: { x: number; y: number };
	width: number;
	height: number;
	fontSize?: number;
	fontFamily?: string;
};

type GeneratedContestData = {
	inputs: Array<Record<string, string>>;
	firstPageSchemas: TextSchema[];
	continuationPageSchemas: TextSchema[][];
};

type TestableGenerator = {
	generateContestData: (baseInputs: Array<Record<string, string>>) => GeneratedContestData;
};

const estimateCharsPerLine = (width: number, fontSize: number): number => {
	const averageGlyphWidth = fontSize * 0.55;
	return Math.max(12, Math.floor(width / averageGlyphWidth));
};

const voterCardDetails: VoterCardDetailRow = {
	id: 'card-1',
	cardNumber: 'CARD123',
	status: 'generated',
	firstName: 'Alex',
	lastName: 'Voter',
	streetAddress: '123 Main St',
	city: 'Denver',
	state: 'CO',
	zipCode: '80014',
	contestGroupName: 'General Election',
	contestGroupId: 'group-1',
	createdAt: new Date('2026-03-10T00:00:00.000Z'),
	updatedAt: new Date('2026-03-10T00:00:00.000Z'),
	pollingStationName: 'Community Center',
	pollingStationStreet: '456 Polling Pl',
	pollingStationCity: 'Denver',
	pollingStationState: 'CO',
	pollingStationZip: '80014'
};

function generateContestData(contests: AggregatedContestDetails[]): GeneratedContestData {
	const generator = new VoterCardGenerator(voterCardDetails, contests);
	const testable = generator as unknown as TestableGenerator;
	return testable.generateContestData([{}]);
}

function collectContestSchemas(result: GeneratedContestData): TextSchema[] {
	return [result.firstPageSchemas, ...result.continuationPageSchemas]
		.flat()
		.filter((schema) => schema.name.startsWith('contest_'));
}

describe('VoterCardGenerator contest text wrapping', () => {
	it('wraps long contest text into schema-sized lines', () => {
		const contests: AggregatedContestDetails[] = [
			{
				id: 'contest-1',
				title: 'School board district representative election for at-large seat',
				description:
					'This contest includes candidate statements and requires careful review of each qualification and public service history.',
				status: 'active',
				contestItemId: 'item-1',
				contestItemTitle:
					'Jordan Montgomery with a very long candidate name to force wrapping across multiple lines',
				contestItemAuxiliaryText: 'Independent',
				contestItemType: 'candidate'
			}
		];

		const result = generateContestData(contests);
		const input = result.inputs[0];
		const schemas = collectContestSchemas(result);
		const lineSchemas = schemas.filter((schema) => schema.name.includes('_line_'));

		expect(lineSchemas.length).toBeGreaterThan(3);

		for (const schema of lineSchemas) {
			const value = input[schema.name];
			expect(value).toBeTypeOf('string');
			expect(schema.fontSize).toBeTypeOf('number');
			const maxChars = estimateCharsPerLine(schema.width, schema.fontSize as number);
			expect(value.length).toBeLessThanOrEqual(maxChars);
		}
	});

	it('splits unbroken long words so lines remain within text width budget', () => {
		const contests: AggregatedContestDetails[] = [
			{
				id: 'contest-1',
				title: 'A'.repeat(240),
				description: null,
				status: 'active',
				contestItemId: 'item-1',
				contestItemTitle: 'B'.repeat(220),
				contestItemAuxiliaryText: null,
				contestItemType: 'candidate'
			}
		];

		const result = generateContestData(contests);
		const input = result.inputs[0];
		const schemas = collectContestSchemas(result);

		const titleLines = schemas.filter((schema) => schema.name.startsWith('contest_title_0_line_'));
		const itemLines = schemas.filter((schema) => schema.name.startsWith('contest_item_0_0_line_'));

		expect(titleLines.length).toBeGreaterThan(1);
		expect(itemLines.length).toBeGreaterThan(1);

		for (const schema of [...titleLines, ...itemLines]) {
			const value = input[schema.name];
			const maxChars = estimateCharsPerLine(schema.width, schema.fontSize as number);
			expect(value.length).toBeLessThanOrEqual(maxChars);
		}
	});

	it('creates continuation pages and keeps line y-positions inside page limits', () => {
		const contests: AggregatedContestDetails[] = Array.from({ length: 45 }, (_, index) => ({
			id: `contest-${index}`,
			title: `Contest ${index} with additional descriptive content to increase wrapped line usage`,
			description:
				'Long contest description text that should wrap and eventually cause continuation pages while still respecting vertical bounds.',
			status: 'active',
			contestItemId: `item-${index}`,
			contestItemTitle:
				'Candidate option with long narrative text to push this section to subsequent pages during generation.',
			contestItemAuxiliaryText: 'No party preference',
			contestItemType: 'candidate'
		}));

		const result = generateContestData(contests);
		expect(result.continuationPageSchemas.length).toBeGreaterThan(0);

		const allPages: TextSchema[][] = [result.firstPageSchemas, ...result.continuationPageSchemas];
		for (let pageIndex = 0; pageIndex < allPages.length; pageIndex += 1) {
			const maxY = pageIndex === 0 ? 275 : 280;
			for (const schema of allPages[pageIndex]) {
				expect(schema.position.y + schema.height).toBeLessThanOrEqual(maxY);
			}
		}
	});
});
