import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'voter', 'super_admin']);
export const contestItemTypeEnum = pgEnum('contest_item_type', [
	'candidate',
	'initiative',
	'other'
]);
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	email: text('email').notNull().unique(),
	hashedPassword: text('hashed_password').notNull(),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	role: roleEnum().notNull().default('voter'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const address = pgTable('address', {
	id: text('id').primaryKey(),
	streetAddress: text('street_address').notNull(),
	city: text('city').notNull(),
	state: text('state').notNull(),
	zipCode: text('zip_code').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const userAddress = pgTable('user_address', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	addressId: text('address_id')
		.notNull()
		.references(() => address.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const contestGroupPollingStation = pgTable('contest_group_polling_station', {
	id: text('id').primaryKey(),
	contestGroupId: text('contest_group_id')
		.notNull()
		.references(() => contestGroup.id, { onDelete: 'cascade' }),
	pollingStationId: text('polling_station_id')
		.notNull()
		.references(() => pollingStation.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/* A contest group is a way to group multiple contests together, e.g. "2024 General Election" 
where voters can participate in multiple contests (e.g. "President", "Senate", "House of Representatives") that are all part of the same contest group.
*/
export const contestGroup = pgTable('contest_group', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/* A contest is something that voters can participate in =- it contains multiple contest items */
export const contest = pgTable('contest', {
	id: text('id').primaryKey(),
	contestGroupId: text('contest_group_id')
		.notNull()
		.references(() => contestGroup.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	description: text('description'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/* This is the selection the voter can pick from */
export const contestItem = pgTable('contest_item', {
	id: text('id').primaryKey(),
	contestId: text('contest_id')
		.notNull()
		.references(() => contest.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	auxiliaryText: text('auxiliary_text'),
	contestItemType: contestItemTypeEnum().notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const voterChoice = pgTable('voter_choice', {
	id: text('id').primaryKey(),
	contestId: text('contest_id')
		.notNull()
		.references(() => contest.id, { onDelete: 'cascade' }),
	contestItemId: text('contest_item_id')
		.notNull()
		.references(() => contestItem.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const pollingStation = pgTable('polling_station', {
	id: text('id').primaryKey(),
	name: text('name'),
	addressId: text('address_id')
		.notNull()
		.references(() => address.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// TBD: Fix this to determine eligibility based on address and polling station and date ranges
export const voterEligibility = pgTable('voter_eligibility', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	pollingStationId: text('polling_station_id')
		.notNull()
		.references(() => pollingStation.id, { onDelete: 'cascade' }),
	contestGroupId: text('contest_group_id')
		.notNull()
		.references(() => contestGroup.id, { onDelete: 'cascade' }),
	contestId: text('contest_id')
		.notNull()
		.references(() => contest.id, { onDelete: 'cascade' }),
	isEligible: boolean('is_eligible').default(false),
	isComplete: boolean('is_complete').default(false), // This field can be used to track whether the eligibility check has been completed for this voter (e.g. if there are any manual steps that need to be taken to verify the voter's eligibility, this can be marked as complete once those steps are done)
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Keep a table that tracks which contests an admin is responsible for managing (1 to many relationship)
export const adminContestGroup = pgTable('admin_contest_group', {
	id: text('id').primaryKey(),
	adminId: text('admin_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	contestGroupId: text('contest_group_id')
		.notNull()
		.references(() => contestGroup.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// TODO: Voter card table to track which voters have been issued voter cards and their status
// There should be something in this table that generates barcode or QR code for the voter card that can be scanned at the polling station to verify the voter's identity and eligibility to vote
export const voterCard = pgTable('voter_card', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	contestGroupId: text('contest_group_id')
		.notNull()
		.references(() => contestGroup.id, { onDelete: 'cascade' }),
	cardStatus: text('card_status').notNull(), // e.g. 'issued', 'active', 'revoked'
	cardCode: text('card_code').notNull(), // This is the code that can be scanned at the polling station
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});
