using System.Collections.Generic;
using System.Threading.Tasks;
using users.Model;

namespace users.Repository
{
    /// <summary>
    /// Repository contract for user-related persistence operations.
    /// Implementations are responsible for data access and should not contain
    /// business logic or authorization concerns. Controllers should enforce
    /// authentication/authorization (e.g. JWT & role-based policies) before
    /// invoking repository methods.
    /// </summary>
    public interface IUserRepository
    {
        /// <summary>
        /// Retrieves all users from the underlying store.
        /// </summary>
        /// <returns>A collection of Users.</returns>
        Task<IEnumerable<Users>> GetUsersAsync();

        /// <summary>
        /// Retrieves a single user matching the provided credentials.
        /// </summary>
        /// <param name="login">User login identifier.</param>
        /// <param name="password">User password (as provided by caller).</param>
        /// <returns>The matching Users instance, or null if not found.</returns>
        Task<Users> GetUserAsync(string login, string password);

        /// <summary>
        /// Adds a new user to the underlying store.
        /// </summary>
        /// <param name="user">User entity to add.</param>
        Task AddUserAsync(Users user);

        /// <summary>
        /// Updates an existing user in the underlying store.
        /// </summary>
        /// <param name="user">Updated user entity.</param>
        Task EditUserAsync(Users user);

        /// <summary>
        /// Removes a user from the underlying store.
        /// </summary>
        /// <param name="user">User entity to remove.</param>
        Task DeleteUserAsync(Users user);

        /// <summary>
        /// Commits queued changes to the data store.
        /// </summary>
        /// <returns>True if changes were persisted; otherwise false.</returns>
        Task<bool> SaveChangesAsync();
    }
}
