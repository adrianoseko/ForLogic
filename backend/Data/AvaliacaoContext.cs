using System;
using System.Linq;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Avaliacao.Model;

namespace Avaliacao.Data
{
    /// <summary>
    /// Interface abstraction for the EF DbContext used by the application.
    /// Improves testability and follows the Dependency Inversion principle.
    /// </summary>
    public interface IAvaliacaoContext
    {
        DbSet<Avaliacao> Avaliacoes { get; set; }
    }

    /// <summary>
    /// Application DbContext for Avaliacao entities.
    /// Keeps the original behavior but adds interface-based design for better SOLID compliance.
    /// </summary>
    public class AvaliacaoContext : DbContext, IAvaliacaoContext
    {
        public AvaliacaoContext(DbContextOptions<AvaliacaoContext> options) : base(options) { }

        public DbSet<Avaliacao> Avaliacoes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureAvaliacaoEntity(modelBuilder);
            base.OnModelCreating(modelBuilder);
        }

        private static void ConfigureAvaliacaoEntity(ModelBuilder modelBuilder)
        {
            var avaliacaoEntity = modelBuilder.Entity<Avaliacao>();
            // Maintain existing behavior: Id is generated on add
            avaliacaoEntity.Property(x => x.Id).ValueGeneratedOnAdd();
        }
    }

    /// <summary>
    /// Extension methods to centralize registration of the DbContext and application-level
    /// cross-cutting concerns such as authentication, authorization policies and CORS.
    /// These helpers do not change the DbContext behavior but provide a single spot to
    /// wire recommended security practices (JWT auth, role-based policies, restricted CORS).
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        public const string DefaultCorsPolicyName = "DefaultCorsPolicy";
        public const string AdminPolicy = "RequireAdminRole";
        public const string UserPolicy = "RequireUserRole";

        /// <summary>
        /// Registers the AvaliacaoContext with the provided options action.
        /// Keeps the same behavior as before but registers the context behind an interface.
        /// </summary>
        public static IServiceCollection AddAvaliacaoContext(this IServiceCollection services, Action<DbContextOptionsBuilder> optionsAction)
        {
            if (services == null) throw new ArgumentNullException(nameof(services));
            if (optionsAction == null) throw new ArgumentNullException(nameof(optionsAction));

            services.AddDbContext<AvaliacaoContext>(optionsAction);
            services.AddScoped<IAvaliacaoContext>(provider => provider.GetService<AvaliacaoContext>());
            return services;
        }

        /// <summary>
        /// Configures JWT based authentication. Expects configuration keys under "Jwt": Key, Issuer, Audience.
        /// Does not enable any authentication by itself — callers must invoke this in Startup/Program.
        /// </summary>
        public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            if (services == null) throw new ArgumentNullException(nameof(services));
            if (configuration == null) throw new ArgumentNullException(nameof(configuration));

            var jwtSection = configuration.GetSection("Jwt");
            var key = jwtSection["Key"];
            var issuer = jwtSection["Issuer"];
            var audience = jwtSection["Audience"];

            if (string.IsNullOrWhiteSpace(key)) throw new InvalidOperationException("JWT signing key is not configured. Please set Jwt:Key in configuration.");

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
                    ValidateAudience = !string.IsNullOrWhiteSpace(audience),
                    ValidAudience = audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(2)
                };
            });

            return services;
        }

        /// <summary>
        /// Adds role-based authorization policies for controllers/endpoints.
        /// - "RequireAdminRole": requires role "Admin"
        /// - "RequireUserRole": requires role "User"
        /// Callers can reference these policy names in Authorize attributes.
        /// </summary>
        public static IServiceCollection AddAuthorizationPolicies(this IServiceCollection services)
        {
            if (services == null) throw new ArgumentNullException(nameof(services));

            services.AddAuthorization(options =>
            {
                options.AddPolicy(AdminPolicy, policy => policy.RequireRole("Admin").RequireAuthenticatedUser());
                options.AddPolicy(UserPolicy, policy => policy.RequireRole("User").RequireAuthenticatedUser());
            });

            return services;
        }

        /// <summary>
        /// Configures CORS with a named policy. In Development the caller can allow a broader set described
        /// by configuration, but in Production this enforces explicit origins from configuration and will
        /// throw if none are provided to avoid implicit AllowAll deployments.
        /// Configuration: Cors:AllowedOrigins (comma separated) or an array under Cors:AllowedOrigins
        /// </summary>
        public static IServiceCollection AddConfiguredCors(this IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
        {
            if (services == null) throw new ArgumentNullException(nameof(services));
            if (configuration == null) throw new ArgumentNullException(nameof(configuration));
            if (environment == null) throw new ArgumentNullException(nameof(environment));

            var originsConfig = configuration.GetSection("Cors:AllowedOrigins");
            string[] origins = Array.Empty<string>();

            if (originsConfig.Exists())
            {
                // Support both string (comma-separated) and array styles
                if (originsConfig.Value != null)
                {
                    origins = originsConfig.Value.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                                                   .Select(s => s.Trim())
                                                   .Where(s => !string.IsNullOrWhiteSpace(s))
                                                   .ToArray();
                }
                else
                {
                    origins = originsConfig.Get<string[]>() ?? Array.Empty<string>();
                }
            }

            services.AddCors(options =>
            {
                options.AddPolicy(DefaultCorsPolicyName, builder =>
                {
                    if (environment.IsDevelopment())
                    {
                        // In development allow local origins if provided; otherwise restrict to localhost defaults
                        if (origins.Length > 0)
                        {
                            builder.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
                        }
                        else
                        {
                            builder.WithOrigins("https://localhost:5001", "http://localhost:5000").AllowAnyHeader().AllowAnyMethod().AllowCredentials();
                        }
                    }
                    else
                    {
                        // Production: require explicit allowed origins; never allow all
                        if (origins.Length == 0)
                        {
                            throw new InvalidOperationException("No CORS origins configured for production. Set Cors:AllowedOrigins in configuration.");
                        }

                        builder.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
                    }
                });
            });

            return services;
        }
    }
}
