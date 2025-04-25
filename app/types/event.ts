// Naming convention: ApiEvent due to Native Event is a reserved word
export interface ApiEvent {
	id: string;
	title: string;
	description: string;
	date: string;
	venue: string;
	organization: string;
	status: string;
}
