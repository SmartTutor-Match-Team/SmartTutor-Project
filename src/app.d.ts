// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: string;
				name: string;
				email: string;
				role: "STUDENT" | "TUTOR";
				image: string | null;
			} | null;
			profile: {
				id: string;
				bio: string | null;
				subject: string;
				hourlyRate: number;
				profileImageUrl: string | null;
			} | null;
		}
		interface PageData {
			users: {
				id: string;
				name: string;
				email: string;
				role: "STUDENT" | "TUTOR";
				image: string | null;
			} | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
