/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_HOME: string;
	readonly VITE_CLIENT: string;
	readonly VITE_AUTHORITY: string;
	readonly VITE_SCOPE: string;
	readonly VITE_CALLBACK: string;
	readonly VITE_API_BASE_URL: string;
	readonly VITE_LOGOUT: string;
	readonly VITE_USE_MOCK_AUTH?: string;
	readonly VITE_ROLE_CLAIM?: string;
	readonly VITE_SILENT_CALLBACK?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
