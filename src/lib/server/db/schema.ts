import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

const roleEnum = pgEnum('role', ['admin', 'voter']);

export const user = pgTable('user', {
	id: text('id').primaryKey(),
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

export const pollingStationAddress = pgTable('polling_station_address', {
	id: text('id').primaryKey(),
	pollingStationId: text('polling_station_id')
		.notNull()
		.references(() => pollingStation.id, { onDelete: 'cascade' }),
	addressId: text('address_id')
		.notNull()
		.references(() => address.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const contestPollingStation = pgTable('contest_polling_station', {
	id: text('id').primaryKey(),
	contestId: text('contest_id')
		.notNull()
		.references(() => contest.id, { onDelete: 'cascade' }),
	pollingStationId: text('polling_station_id')
		.notNull()
		.references(() => pollingStation.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const contest = pgTable('contest', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description').notNull(),
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
	auxiliaryText: text('auxiliary_text').notNull(),
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
	name: text('name').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// TBD: Fix this to determine elibility based on address and polling station and date ranges
export const voterEligibility = pgTable('voter_eligibility', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	pollingStationId: text('polling_station_id')
		.notNull()
		.references(() => pollingStation.id, { onDelete: 'cascade' }),
	isEligible: text('is_eligible').notNull(),
	isComplete: text('is_complete').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});
