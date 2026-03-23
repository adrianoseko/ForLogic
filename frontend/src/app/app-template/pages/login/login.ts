export class Login {
    private _username: string;
    private _password: string;

    /**
     * Simple data model for login credentials.
     * Keep this model minimal and serializable. Avoid storing tokens here.
     * Use a dedicated AuthService to perform authentication, store tokens, and enforce RBAC.
     */
    constructor(username: string = '', password: string = '') {
        this._username = username;
        this._password = password;
    }

    public get username(): string {
        return this._username;
    }

    public set username(value: string) {
        this._username = value ?? '';
    }

    public get password(): string {
        return this._password;
    }

    public set password(value: string) {
        this._password = value ?? '';
    }

    /**
     * Produce a minimal payload suitable for sending to an authentication endpoint.
     */
    public toAuthPayload(): { username: string; password: string } {
        return {
            username: this._username,
            password: this._password,
        };
    }

    /**
     * Clear sensitive fields (e.g. after submitting credentials).
     */
    public clearSensitiveData(): void {
        this._password = '';
    }

    /**
     * Create a Login model from a plain object (e.g. form values or JSON).
     */
    public static from(input: Partial<{ username: string; password: string }>): Login {
        const username = input?.username ?? '';
        const password = input?.password ?? '';
        return new Login(username, password);
    }

    /**
     * Build an Authorization header value for a Bearer JWT.
     * Note: this method only formats the header; obtaining and storing the JWT
     * must be done by a secure AuthService (httpOnly cookies or secure storage).
     */
    public static bearerHeader(token: string): string {
        return `Bearer ${token}`;
    }

    /**
     * Extract roles from a JWT access token without validating it locally.
     * This is a convenience method for client-side role checks (UI/route guard only).
     * Always perform server-side RBAC enforcement as well.
     */
    public static parseJwtRoles(token: string): string[] {
        if (!token) {
            return [];
        }

        try {
            // Trim Bearer prefix if present
            const raw = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
            const parts = raw.split('.');
            if (parts.length < 2) {
                return [];
            }

            // Decode payload (base64url)
            const payload = parts[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            // Add padding if needed
            const pad = payload.length % 4;
            const padded = payload + (pad === 2 ? '==' : pad === 3 ? '=' : pad === 0 ? '' : '');
            const decoded = atob(padded);
            const parsed = JSON.parse(decoded);

            // Common claim names: roles, role, realm_access.roles (keycloak), permissions
            const rolesClaim = parsed.roles || parsed.role || (parsed.realm_access && parsed.realm_access.roles) || parsed.permissions;

            if (!rolesClaim) {
                return [];
            }

            if (Array.isArray(rolesClaim)) {
                return rolesClaim.map(String);
            }

            if (typeof rolesClaim === 'string') {
                // comma or space separated
                return rolesClaim.split(/[ ,]+/).filter(Boolean);
            }

            return [];
        } catch (e) {
            // Fail-safe: do not throw from a utility used in UI guards; return empty roles
            return [];
        }
    }

    /**
     * Does the token include the specified role? Useful for client-side route guards.
     * Always keep server authorization authoritative.
     */
    public static hasRole(token: string, role: string): boolean {
        if (!role) {
            return false;
        }
        const roles = Login.parseJwtRoles(token);
        return roles.includes(role);
    }
}
