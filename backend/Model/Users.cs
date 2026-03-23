using System;

/*
 Domain model: User

 Notes for integrators / devops (not implemented in this model):
 - Authentication and authorization must be configured at the application level (e.g. JWT bearer or secure cookie authentication).
 - Controller endpoints should be decorated with role-based authorization policies (e.g. [Authorize(Roles = "Admin")])
   and policies should be registered centrally via AuthorizationOptions.
 - CORS must be restricted to known origins in production. Use a configuration-driven approach to load allowed origins
   and do NOT use AllowAnyOrigin in production. Separate development and production configuration securely
   (e.g. appsettings.Development.json vs appsettings.Production.json, or environment variables / secret store).
 - Keep security concerns out of domain model classes. This file intentionally contains only domain behavior.
*/

namespace Users.Model
{
    /// <summary>
    /// Represents a user in the domain.
    /// The class intentionally keeps behavior minimal: identity, login and password storage and simple updates.
    /// Note: This class stores the password string for compatibility with the original implementation.
    /// In a real-world system, passwords should be hashed and salted; perform hashing outside this domain model
    /// or provide a hashed-password property instead.
    /// </summary>
    public sealed class User : IEquatable<User>
    {
        /// <summary>
        /// Gets the unique identifier for the user.
        /// </summary>
        public int Id { get; private set; }

        /// <summary>
        /// Gets the login name for the user.
        /// </summary>
        public string Login { get; private set; }

        /// <summary>
        /// Gets the password for the user.
        /// NOTE: Storing raw passwords is not recommended. Keep this here to preserve original behavior.
        /// </summary>
        public string Password { get; private set; }

        /// <summary>
        /// Initializes a new instance of <see cref="User"/>.
        /// Constructor behavior preserved to remain compatible with existing callers.
        /// </summary>
        /// <param name="id">User identifier.</param>
        /// <param name="login">Login name.</param>
        /// <param name="password">Password.</param>
        public User(int id, string login, string password)
        {
            Id = id;
            Login = login;
            Password = password;
        }

        /// <summary>
        /// Updates the login for the user.
        /// Throws an <see cref="ArgumentException"/> when the provided login is null, empty, or whitespace.
        /// </summary>
        /// <param name="newLogin">The new login value.</param>
        public void UpdateLogin(string newLogin)
        {
            Guard.EnsureNotNullOrWhiteSpace(newLogin, nameof(newLogin), "Login cannot be empty or whitespace.");
            Login = newLogin;
        }

        /// <summary>
        /// Updates the password for the user.
        /// Throws an <see cref="ArgumentException"/> when the provided password is null, empty, or whitespace.
        /// </summary>
        /// <param name="newPassword">The new password value.</param>
        public void UpdatePassword(string newPassword)
        {
            Guard.EnsureNotNullOrWhiteSpace(newPassword, nameof(newPassword), "Password cannot be empty or whitespace.");
            Password = newPassword;
        }

        /// <inheritdoc />
        public override bool Equals(object obj)
        {
            return Equals(obj as User);
        }

        /// <inheritdoc />
        public bool Equals(User other)
        {
            if (ReferenceEquals(other, null)) return false;
            if (ReferenceEquals(this, other)) return true;
            return Id == other.Id
                   && string.Equals(Login, other.Login, StringComparison.Ordinal)
                   && string.Equals(Password, other.Password, StringComparison.Ordinal);
        }

        /// <inheritdoc />
        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 17;
                hash = hash * 23 + Id.GetHashCode();
                hash = hash * 23 + (Login != null ? Login.GetHashCode() : 0);
                hash = hash * 23 + (Password != null ? Password.GetHashCode() : 0);
                return hash;
            }
        }

        /// <inheritdoc />
        public override string ToString()
        {
            return $"User {{ Id = {Id}, Login = {Login} }}";
        }

        /// <summary>
        /// Small guard helper to centralize validation logic used by this model.
        /// Kept internal to this file to avoid introducing new public dependencies.
        /// </summary>
        private static class Guard
        {
            public static void EnsureNotNullOrWhiteSpace(string value, string paramName, string message)
            {
                if (string.IsNullOrWhiteSpace(value))
                {
                    // Preserve original behavior: throw ArgumentException for null/empty/whitespace inputs
                    throw new ArgumentException(message, paramName);
                }
            }
        }
    }
}
