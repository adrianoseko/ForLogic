using System.Collections.Generic;
using System.Threading.Tasks;
using avaliacao.Model;

// NOTE (Security & Architecture):
// This repository interface is intentionally focused on data access concerns only.
// Authentication (JWT or cookie-based) and role-based authorization should be applied
// at the controller layer (or via middleware). Configure authentication schemes and
// authorization policies (e.g., Roles: Admin/User) in your Startup/Program configuration.
// For CORS, restrict allowed origins in production (do NOT use AllowAll). Maintain separate
// development and production configuration sources (appsettings.Development.json /
// appsettings.Production.json or environment variables) and ensure secrets (keys) are
// stored in a secure store (e.g., user-secrets, Azure Key Vault, or environment vars).

namespace avaliacao.Repository
{
    /// <summary>
    /// Repository contract for managing <see cref="Avaliacao"/> entities.
    /// </summary>
    public interface IAvaliacaoRepository
    {
        /// <summary>
        /// Retrieves all Avaliacao records.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains a collection of <see cref="Avaliacao"/>.</returns>
        Task<IEnumerable<Avaliacao>> GetAvaliacoesAsync();

        /// <summary>
        /// Retrieves an Avaliacao by its identifier.
        /// </summary>
        /// <param name="id">The identifier of the Avaliacao.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the matching <see cref="Avaliacao"/>, or null if not found.</returns>
        Task<Avaliacao> GetAvaliacaoByIdAsync(int id);

        /// <summary>
        /// Adds a new Avaliacao.
        /// </summary>
        /// <param name="avaliacao">The Avaliacao to add.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task AddAvaliacaoAsync(Avaliacao avaliacao);

        /// <summary>
        /// Updates an existing Avaliacao.
        /// </summary>
        /// <param name="avaliacao">The Avaliacao with updated values.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task UpdateAvaliacaoAsync(Avaliacao avaliacao);

        /// <summary>
        /// Deletes an Avaliacao by its identifier.
        /// </summary>
        /// <param name="id">The identifier of the Avaliacao to delete.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task DeleteAvaliacaoAsync(int id);

        /// <summary>
        /// Persists pending changes to the data store.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result is true if any changes were saved; otherwise, false.</returns>
        Task<bool> SaveChangesAsync();
    }
}
