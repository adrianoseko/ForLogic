#nullable enable
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using client.Model;

namespace client.Repository
{
    /// <summary>
    /// Repository contract for client-related data operations.
    /// Keep implementations focused on a single responsibility (data access) and return domain models.
    /// </summary>
    public interface IClientRepository
    {
        /// <summary>
        /// Retrieves all clients.
        /// </summary>
        /// <returns>An enumerable of <see cref="Client"/> instances.</returns>
        Task<IEnumerable<Client>> GetClientsAsync();

        /// <summary>
        /// Retrieves a client by its CNPJ identifier.
        /// Returns null if the client does not exist.
        /// </summary>
        /// <param name="cnpj">Numeric CNPJ identifier.</param>
        /// <returns>A <see cref="Client"/> instance or null.</returns>
        Task<Client?> GetClientByCnpjAsync(int cnpj);

        /// <summary>
        /// Adds a new client to the repository.
        /// Implementations should validate the entity before persisting.
        /// </summary>
        /// <param name="client">Client entity to add.</param>
        Task AddClientAsync(Client client);

        /// <summary>
        /// Updates an existing client.
        /// </summary>
        /// <param name="client">Client entity with updated values.</param>
        Task UpdateClientAsync(Client client);

        /// <summary>
        /// Deletes a client from the repository.
        /// </summary>
        /// <param name="client">Client entity to delete.</param>
        Task DeleteClientAsync(Client client);

        /// <summary>
        /// Commits any pending changes to the backing store.
        /// Returns true when the commit resulted in one or more state changes.
        /// </summary>
        Task<bool> SaveChangesAsync();
    }

    /// <summary>
    /// Centralized constants and guidance for authentication, authorization and CORS configuration.
    /// Use these constants in Startup/Program and in controller attributes to keep policies consistent.
    ///
    /// Implementation guidance (do not keep AllowAll in production):
    /// - Use JWT Bearer authentication with properly validated signing keys and token lifetimes.
    /// - Map roles/claims from your identity provider and enforce via policies such as:
    ///     services.AddAuthorization(options =>
    ///     {
    ///         options.AddPolicy(AuthPolicies.AdminPolicy, p => p.RequireRole(AuthPolicies.AdminRole));
    ///         options.AddPolicy(AuthPolicies.UserPolicy, p => p.RequireRole("User"));
    ///     });
    /// - Protect controllers/actions with [Authorize(Policy = AuthPolicies.AdminPolicy)] or [Authorize]
    /// - Configure CORS to allow only known origins in production (see CorsPolicies).
    /// </summary>
    public static class AuthPolicies
    {
        // Policy names
        public const string RequireAuthenticatedUser = "RequireAuthenticatedUser";
        public const string AdminPolicy = "RequireAdministratorRole";
        public const string UserPolicy = "RequireUserRole";

        // Role names (adjust to match your identity provider)
        public const string AdminRole = "Administrator";
        public const string UserRole = "User";

        // Example default scopes/claims could also be added here as constants
    }

    /// <summary>
    /// CORS policy name(s) to be used by the application.
    /// Register only the origins required by your front-end in production.
    /// Example registration is provided in comments below.
    /// </summary>
    public static class CorsPolicies
    {
        // Named policy used throughout the app instead of AllowAll.
        public const string AllowSpecificOrigins = "AllowSpecificOrigins";

        // Example usage in Program.cs / Startup.cs:
        // services.AddCors(options =>
        // {
        //     options.AddPolicy(CorsPolicies.AllowSpecificOrigins, builder =>
        //     {
        //         builder.WithOrigins("https://app.example.com", "https://admin.example.com")
        //                .AllowCredentials()
        //                .AllowAnyHeader()
        //                .AllowAnyMethod();
        //     });
        // });
    }
}
