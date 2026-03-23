using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using user.Data;
using users.Model;

namespace user.Repository
{
    /// <summary>
    /// Repository responsible for CRUD operations against Users store.
    /// Note: Authentication, authorization and CORS configuration are handled at the controller and application startup layers (see project Startup/Program).
    /// </summary>
    public class UserRepository : IUserRepository
    {
        private readonly UserContext _context;
        private readonly ILogger<UserRepository> _logger;

        /// <summary>
        /// Backwards-compatible constructor. If a logger isn't provided, a no-op logger will be used.
        /// </summary>
        /// <param name="context">Entity Framework user context</param>
        public UserRepository(UserContext context)
            : this(context, NullLogger<UserRepository>.Instance)
        {
        }

        /// <summary>
        /// Primary constructor for the repository (supports DI-provided ILogger).
        /// </summary>
        /// <param name="context">Entity Framework user context</param>
        /// <param name="logger">Logger instance</param>
        public UserRepository(UserContext context, ILogger<UserRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? NullLogger<UserRepository>.Instance;
        }

        /// <summary>
        /// Adds a new user to the DbContext. Note: changes are not persisted until SaveChangesAsync is called.
        /// </summary>
        /// <param name="user">User entity to add</param>
        public async Task AddUserAsync(Users user)
        {
            if (user == null)
            {
                _logger.LogWarning("AddUserAsync called with null user reference.");
                throw new ArgumentNullException(nameof(user));
            }

            try
            {
                await _context.Users.AddAsync(user).ConfigureAwait(false);
                _logger.LogDebug("User queued for addition: {Login}", user.Login);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to add user with login {Login}", user?.Login);
                throw;
            }
        }

        /// <summary>
        /// Retrieves a user matching the provided credentials or null if not found.
        /// </summary>
        /// <param name="login">Login identifier</param>
        /// <param name="password">Password (Senha)</param>
        /// <returns>Matched user or null</returns>
        public async Task<Users?> GetUserAsync(string login, string password)
        {
            try
            {
                return await _context.Users
                    .FirstOrDefaultAsync(x => x.Login == login && x.Senha == password)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get user for login {Login}", login);
                throw;
            }
        }

        /// <summary>
        /// Returns all users from the store.
        /// </summary>
        public async Task<IEnumerable<Users>> GetAllUsersAsync()
        {
            try
            {
                return await _context.Users.ToListAsync().ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve all users.");
                throw;
            }
        }

        /// <summary>
        /// Marks a user as deleted in the DbContext. Persist with SaveChangesAsync.
        /// </summary>
        /// <param name="user">User entity to remove</param>
        public void DeleteUser(Users user)
        {
            if (user == null)
            {
                _logger.LogWarning("DeleteUser called with null user reference.");
                throw new ArgumentNullException(nameof(user));
            }

            try
            {
                _context.Users.Remove(user);
                _logger.LogDebug("User queued for removal: {Login}", user.Login);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to remove user {Login}", user?.Login);
                throw;
            }
        }

        /// <summary>
        /// Marks a user entity as modified in the DbContext. Persist with SaveChangesAsync.
        /// </summary>
        /// <param name="user">User entity to update</param>
        public void UpdateUser(Users user)
        {
            if (user == null)
            {
                _logger.LogWarning("UpdateUser called with null user reference.");
                throw new ArgumentNullException(nameof(user));
            }

            try
            {
                _context.Users.Update(user);
                _logger.LogDebug("User queued for update: {Login}", user.Login);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update user {Login}", user?.Login);
                throw;
            }
        }

        /// <summary>
        /// Persists changes to the database.
        /// </summary>
        /// <returns>True if one or more entities were written to the database</returns>
        public async Task<bool> SaveChangesAsync()
        {
            try
            {
                var result = await _context.SaveChangesAsync().ConfigureAwait(false);
                _logger.LogDebug("SaveChangesAsync result: {ChangesCount}", result);
                return result > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save changes to the database.");
                throw;
            }
        }
    }
}
