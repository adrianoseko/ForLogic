using System;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using client.Model;

namespace client.Data
{
    /// <summary>
    /// Application DbContext for Client entities.
    /// Contains configuration for the Client entity model.
    /// </summary>
    public interface IClientContext
    {
        /// <summary>
        /// Clients DbSet.
        /// </summary>
        DbSet<Client> Clients { get; }
    }

    public class ClientContext : DbContext, IClientContext
    {
        /// <summary>
        /// Creates a new instance of <see cref="ClientContext"/>.
        /// </summary>
        /// <param name="options">DbContext options.</param>
        public ClientContext(DbContextOptions<ClientContext> options) : base(options)
        {
            // Options validation is deferred to the framework; keep constructor lightweight.
        }

        /// <summary>
        /// Clients table.
        /// Initialized to avoid nullability warnings in consumers.
        /// </summary>
        public DbSet<Client> Clients { get; set; } = null!;

        /// <summary>
        /// Configure EF model.
        /// Separated into a small helper to keep OnModelCreating concise and testable.
        /// </summary>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            if (modelBuilder == null) throw new ArgumentNullException(nameof(modelBuilder));

            ConfigureClientEntity(modelBuilder);

            // Call base to allow EF Core internal configuration to run (keeps behavior consistent).
            base.OnModelCreating(modelBuilder);
        }

        private static void ConfigureClientEntity(ModelBuilder modelBuilder)
        {
            var clientEntity = modelBuilder.Entity<Client>();
            clientEntity.Property(c => c.Id).ValueGeneratedOnAdd();
        }
    }

    /// <summary>
    /// Extension methods to centralize registration of infrastructure pieces such as
    /// authentication, authorization policies and CORS. These helpers are kept alongside
    /// the DbContext to make it easy for developers to wire up the application in one place.
    ///
    /// Note: These methods do not change any runtime behavior of ClientContext; they merely
    /// provide recommended, centralized DI setup helpers for the web application.
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Adds JWT authentication and a couple of authorization policies for role-based access.
        /// Expects configuration sections: Jwt:Key, Jwt:Issuer, Jwt:Audience.
        /// Throws if required configuration is missing to fail fast in production.
        /// </summary>
        public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            if (services == null) throw new ArgumentNullException(nameof(services));
            if (configuration == null) throw new ArgumentNullException(nameof(configuration));

            var jwtSection = configuration.GetSection("Jwt");
            var key = jwtSection["Key"];
            var issuer = jwtSection["Issuer"];
            var audience = jwtSection["Audience"];

            if (string.IsNullOrWhiteSpace(key))
                throw new InvalidOperationException("JWT configuration is missing 'Jwt:Key'.");

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                // Require HTTPS in production; the setting below keeps security posture strong
                options.RequireHttpsMetadata = true;
                options.SaveToken = true;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = signingKey,
                    ValidateIssuer = !string.IsNullOrWhiteSpace(issuer),
                    ValidIssuer = issuer,
                    ValidateAudience = !string.IsNullOrWhiteSpace(audience),
                    ValidAudience = audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(2)
                };
            });

            // Role-based policies. Controllers/endpoints can opt in using [Authorize(Policy = "RequireAdministratorRole")]
            services.AddAuthorization(options =>
            {
                options.AddPolicy("RequireAdministratorRole", policy => policy.RequireRole("Administrator"));
                options.AddPolicy("RequireUserRole", policy => policy.RequireRole("User", "Administrator"));
            });

            return services;
        }

        /// <summary>
        /// Adds a named CORS policy. In development this helper allows localhost origins commonly used
        /// by SPA dev servers. In production it requires a configured list of allowed origins
        /// (configuration key: Cors:AllowedOrigins). This avoids AllowAll in production.
        /// </summary>
        public static IServiceCollection AddCorsPolicy(this IServiceCollection services, IConfiguration configuration, bool isDevelopment)
        {
            if (services == null) throw new ArgumentNullException(nameof(services));
            if (configuration == null) throw new ArgumentNullException(nameof(configuration));

            const string policyName = "DefaultCorsPolicy";

            services.AddCors(options =>
            {
                if (isDevelopment)
                {
                    // Allow common localhost ports used by front-end dev servers.
                    options.AddPolicy(policyName, builder =>
                        builder.WithOrigins("http://localhost:3000", "http://localhost:4200")
                               .AllowAnyHeader()
                               .AllowAnyMethod()
                               .AllowCredentials());
                }
                else
                {
                    // In production, require explicit origins from configuration to avoid AllowAll.
                    var origins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
                    if (origins == null || origins.Length == 0)
                    {
                        throw new InvalidOperationException("Production CORS policy requires configuration key 'Cors:AllowedOrigins' with at least one origin.");
                    }

                    options.AddPolicy(policyName, builder =>
                        builder.WithOrigins(origins)
                               .AllowAnyHeader()
                               .AllowAnyMethod());
                }
            });

            return services;
        }

        /// <summary>
        /// Helper to register the ClientContext. Expects a connection string named 'ClientDatabase'.
        /// This centralizes configuration and fails fast when configuration is missing.
        /// </summary>
        public static IServiceCollection AddClientDbContext(this IServiceCollection services, IConfiguration configuration)
        {
            if (services == null) throw new ArgumentNullException(nameof(services));
            if (configuration == null) throw new ArgumentNullException(nameof(configuration));

            var connectionString = configuration.GetConnectionString("ClientDatabase");
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("Connection string 'ClientDatabase' is not configured.");
            }

            // Keep provider decision in calling code; default to SQL Server here as a common choice.
            services.AddDbContext<ClientContext>(options => options.UseSqlServer(connectionString));

            return services;
        }
    }
}
