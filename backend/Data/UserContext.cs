using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using users.Model;

namespace user.Data
{
    /// <summary>
    /// Interface to abstract the user data context for better testability and to follow the Dependency Inversion Principle.
    /// </summary>
    public interface IUserContext : IDisposable
    {
        DbSet<Users> Users { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Entity Framework Core DbContext for user-related entities.
    /// </summary>
    public class UserContext : DbContext, IUserContext
    {
        public UserContext(DbContextOptions<UserContext> options) : base(options) { }

        // Keep the DbSet name and type to preserve existing behavior and API.
        public DbSet<Users> Users { get; set; } = null!;

        /// <summary>
        /// Configure EF Core model on startup. Separated into a helper to keep OnModelCreating concise.
        /// </summary>
        /// <param name="modelBuilder">Model builder provided by EF Core.</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Ensure any base configuration is preserved
            base.OnModelCreating(modelBuilder);

            ConfigureUserEntity(modelBuilder);
        }

        private static void ConfigureUserEntity(ModelBuilder modelBuilder)
        {
            var userEntity = modelBuilder.Entity<Users>();
            // Preserve the original behavior: Id generated on add
            userEntity.Property(u => u.Id).ValueGeneratedOnAdd();
        }

        // Explicit interface implementation is not required but exposing SaveChangesAsync keeps the interface contract clear.
        public new Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return base.SaveChangesAsync(cancellationToken);
        }
    }

    /// <summary>
    /// Extension methods to wire up the UserContext, authentication, authorization policies and CORS.
    /// These helpers centralize and document the recommended secure defaults without changing the DbContext behavior.
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Registers the UserContext and exposes IUserContext for DI. The caller provides the DbContext options builder
        /// so this method does not assume any specific database provider.
        /// </summary>
        public static IServiceCollection AddUserContext(this IServiceCollection services, Action<DbContextOptionsBuilder> optionsAction)
        {
            if (services == null) throw new ArgumentNullException(nameof(services));
            if (optionsAction == null) throw new ArgumentNullException(nameof(optionsAction));

            services.AddDbContext<UserContext>(optionsAction);

            // Also register the interface so consumers can depend on IUserContext (improves testability).
            services.AddScoped<IUserContext>(sp => sp.GetRequiredService<UserContext>());

            return services;
        }

        /// <summary>
        /// Configure JWT authentication. Expects configuration values under "Jwt:Key" and optionally "Jwt:Issuer".
        /// Throws if key is missing to avoid starting in an insecure state.
        /// </summary>
        public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            if (services == null) throw new ArgumentNullException(nameof(services));
            if (configuration == null) throw new ArgumentNullException(nameof(configuration));

            var key = configuration["Jwt:Key"];
            var issuer = configuration["Jwt:Issuer"];

            if (string.IsNullOrWhiteSpace(key))
            {
                throw new InvalidOperationException("JWT signing key is not configured. Set configuration key 'Jwt:Key'.");
            }

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = true;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = signingKey,
                    ValidateIssuer = !string.IsNullOrWhiteSpace(issuer),
                    ValidIssuer = issuer,
                    ValidateAudience = false,
                    ValidateLifetime = true
                };
            });

            // Define simple role-based policies. Controllers can reference these policies by name.
            services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
                options.AddPolicy("UserOrAdmin", policy => policy.RequireRole("User", "Admin"));
            });

            return services;
        }

        /// <summary>
        /// Configures CORS with a safe default: in production it must use explicitly configured origins.
        /// In Development a permissive localhost set can be used. Configuration key: "Cors:AllowedOrigins" (comma-separated)
        /// </summary>
        public static IServiceCollection AddConfiguredCors(this IServiceCollection services, IConfiguration configuration, IHostEnvironment environment, string policyName = "DefaultCorsPolicy")
        {
            if (services == null) throw new ArgumentNullException(nameof(services));
            if (configuration == null) throw new ArgumentNullException(nameof(configuration));
            if (environment == null) throw new ArgumentNullException(nameof(environment));

            services.AddCors(options =>
            {
                options.AddPolicy(policyName, builder =>
                {
                    if (environment.IsDevelopment())
                    {
                        // Development: allow common localhost ports for frontend dev servers but do not blanket AllowAnyOrigin in production
                        builder.WithOrigins("http://localhost:3000", "http://localhost:4200", "http://localhost:8080")
                               .AllowAnyHeader()
                               .AllowAnyMethod()
                               .AllowCredentials();
                    }
                    else
                    {
                        var allowed = configuration["Cors:AllowedOrigins"];
                        if (string.IsNullOrWhiteSpace(allowed))
                        {
                            // Fail fast: require explicit configuration in non-development environments.
                            throw new InvalidOperationException("CORS allowed origins are not configured for production. Set 'Cors:AllowedOrigins' configuration.");
                        }

                        var origins = allowed.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

                        builder.WithOrigins(origins)
                               .AllowAnyHeader()
                               .AllowAnyMethod()
                               .AllowCredentials();
                    }
                });
            });

            return services;
        }
    }
}
