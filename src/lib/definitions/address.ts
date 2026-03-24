export type Address = {
	id: string;
	streetAddress: string;
	city: string;
	state: string;
	zipCode: string;
};

export type AddressInput = Omit<Address, 'id'>;

export type NullableAddressInput = {
	[K in keyof AddressInput]: AddressInput[K] | null;
};

export type PollingStationAddress = {
	name: string;
} & Address;
