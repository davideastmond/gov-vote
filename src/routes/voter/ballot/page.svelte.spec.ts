import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

const { submitVoterBallotMock, gotoMock } = vi.hoisted(() => ({
	submitVoterBallotMock: vi.fn(),
	gotoMock: vi.fn()
}));

vi.mock('$lib/remotes/submit-voter-ballot.remote', () => ({
	submitVoterBallot: submitVoterBallotMock
}));

vi.mock('$app/navigation', () => ({
	goto: gotoMock
}));

import Page from './+page.svelte';

function buildContest(overrides: Partial<any> = {}) {
	return {
		id: crypto.randomUUID(),
		title: 'Sample Contest',
		description: 'A sample contest description',
		type: 'candidate',
		maxChoices: 1,
		items: [
			{ id: crypto.randomUUID(), label: 'Option 1', description: 'First option' },
			{ id: crypto.randomUUID(), label: 'Option 2', description: 'Second option' }
		],
		...overrides
	};
}

describe('/voter/ballot/+page.svelte', () => {
	beforeEach(() => {
		submitVoterBallotMock.mockReset();
		gotoMock.mockReset();
	});

	it('renders empty ballot state when no contests are available', async () => {
		render(Page, {
			data: {
				contests: []
			} as any
		});

		const emptyState = page.getByText('No contests are currently available for this ballot.');
		const submitButton = page.getByRole('button', { name: 'Submit Ballot' });

		await expect.element(emptyState).toBeInTheDocument();
		await expect.element(submitButton).toBeDisabled();
	});

	it('enables submit after each contest has one selection', async () => {
		const mayorContest = buildContest({
			title: 'Mayor',
			items: [
				{ id: 'mayor-a', label: 'Alex Rivera', description: 'Independent' },
				{ id: 'mayor-b', label: 'Jordan Lee', description: 'Unity Party' }
			]
		});

		const treasurerContest = buildContest({
			title: 'Treasurer',
			items: [
				{ id: 'treasurer-a', label: 'Morgan Price', description: 'Civic First' },
				{ id: 'treasurer-b', label: 'Taylor Kim', description: 'Forward Coalition' }
			]
		});

		render(Page, {
			data: {
				contests: [mayorContest, treasurerContest]
			} as any
		});

		const submitButton = page.getByRole('button', { name: 'Submit Ballot' });
		await expect.element(submitButton).toBeDisabled();

		await page.getByLabelText('Alex Rivera').click();
		await expect.element(submitButton).toBeDisabled();

		await page.getByLabelText('Morgan Price').click();
		await expect.element(submitButton).toBeEnabled();
	});

	it('disables extra checkbox options after maxChoices is reached', async () => {
		render(Page, {
			data: {
				contests: [
					buildContest({
						title: 'City Council',
						type: 'other',
						maxChoices: 2,
						items: [
							{ id: 'cc-a', label: 'Candidate A', description: 'Ward 1' },
							{ id: 'cc-b', label: 'Candidate B', description: 'Ward 2' },
							{ id: 'cc-c', label: 'Candidate C', description: 'Ward 3' }
						]
					})
				]
			} as any
		});

		const candidateA = page.getByLabelText('Candidate A');
		const candidateB = page.getByLabelText('Candidate B');
		const candidateC = page.getByLabelText('Candidate C');

		await candidateA.click();
		await candidateB.click();

		await expect.element(candidateC).toBeDisabled();
	});
});
