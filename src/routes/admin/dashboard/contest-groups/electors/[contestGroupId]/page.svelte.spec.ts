import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import Page from './+page.svelte';
import type { PageData } from './$types';

function makeData(overrides: Partial<PageData> = {}): PageData {
	return {
		contestGroup: {
			id: 'group-1',
			title: 'Spring 2024 Election',
			description: 'Annual spring election',
			status: 'closed'
		},
		electors: [],
		pagination: {
			pageSize: 10,
			currentPage: 1,
			totalPages: 1,
			totalElectors: 0
		},
		...overrides
	} as PageData;
}

const sampleElector: PageData['electors'][number] = {
	userId: 'user-1',
	firstName: 'Alice',
	lastName: 'Smith',
	username: 'asmith',
	lastVotedAt: new Date('2024-03-15T10:00:00Z'),
	contests: [
		{
			contestId: 'contest-1',
			contestTitle: 'Mayor',
			selections: ['Candidate A']
		}
	],
	voterIdPhoto: null
};

describe('/admin/dashboard/contest-groups/electors/[contestGroupId]/+page.svelte', () => {
	it('renders the page heading with the contest group title', async () => {
		render(Page, { data: makeData() });

		const heading = page.getByRole('heading', { name: /Spring 2024 Election Electors/i });
		await expect.element(heading).toBeInTheDocument();
	});

	it('shows "No Electors Yet" card when there are no electors', async () => {
		render(Page, { data: makeData() });

		const noElectorsTitle = page.getByText('No Electors Yet');
		await expect.element(noElectorsTitle).toBeInTheDocument();
	});

	it('shows elector name cards when electors are present', async () => {
		render(Page, {
			data: makeData({
				electors: [sampleElector],
				pagination: { pageSize: 10, currentPage: 1, totalPages: 1, totalElectors: 1 }
			})
		});

		const electorName = page.getByText('Alice Smith');
		await expect.element(electorName).toBeInTheDocument();
	});

	it('shows elector username when electors are present', async () => {
		render(Page, {
			data: makeData({
				electors: [sampleElector],
				pagination: { pageSize: 10, currentPage: 1, totalPages: 1, totalElectors: 1 }
			})
		});

		const username = page.getByText(/asmith/);
		await expect.element(username).toBeInTheDocument();
	});

	it('shows contest selection for an elector', async () => {
		render(Page, {
			data: makeData({
				electors: [sampleElector],
				pagination: { pageSize: 10, currentPage: 1, totalPages: 1, totalElectors: 1 }
			})
		});

		const contestTitle = page.getByText('Mayor');
		const selection = page.getByText('Candidate A');

		await expect.element(contestTitle).toBeInTheDocument();
		await expect.element(selection).toBeInTheDocument();
	});

	it('shows "View Voter ID" button when elector has a voter ID photo', async () => {
		const electorWithPhoto: PageData['electors'][number] = {
			...sampleElector,
			voterIdPhoto: {
				id: 'photo-1',
				uploadedAt: new Date('2024-03-10T08:00:00Z'),
				photoProxyUrl: '/api/admin/voter-id-photo/photo-1'
			}
		};

		render(Page, {
			data: makeData({
				electors: [electorWithPhoto],
				pagination: { pageSize: 10, currentPage: 1, totalPages: 1, totalElectors: 1 }
			})
		});

		const voterIdButton = page.getByRole('button', { name: /View Voter ID/i });
		await expect.element(voterIdButton).toBeInTheDocument();
	});

	it('shows "No voter ID uploaded" when elector has no voter ID photo', async () => {
		render(Page, {
			data: makeData({
				electors: [sampleElector],
				pagination: { pageSize: 10, currentPage: 1, totalPages: 1, totalElectors: 1 }
			})
		});

		const noPhoto = page.getByText(/No voter ID uploaded/i);
		await expect.element(noPhoto).toBeInTheDocument();
	});

	it('shows pagination controls when there are multiple pages', async () => {
		render(Page, {
			data: makeData({
				electors: [sampleElector],
				pagination: { pageSize: 10, currentPage: 1, totalPages: 3, totalElectors: 25 }
			})
		});

		const pageInfo = page.getByText(/Page 1 of 3/i);
		await expect.element(pageInfo).toBeInTheDocument();
	});

	it('does not show pagination controls when there is only one page', async () => {
		render(Page, {
			data: makeData({
				electors: [sampleElector],
				pagination: { pageSize: 10, currentPage: 1, totalPages: 1, totalElectors: 1 }
			})
		});

		const pageInfo = page.getByText(/Page 1 of 1/i);
		await expect.element(pageInfo).not.toBeInTheDocument();
	});

	it('shows contest group description when present', async () => {
		render(Page, { data: makeData() });

		const description = page.getByText('Annual spring election');
		await expect.element(description).toBeInTheDocument();
	});

	it('shows total elector count', async () => {
		render(Page, {
			data: makeData({
				electors: [sampleElector],
				pagination: { pageSize: 10, currentPage: 1, totalPages: 1, totalElectors: 1 }
			})
		});

		const total = page.getByText(/1 electors with recorded votes/i);
		await expect.element(total).toBeInTheDocument();
	});
});
