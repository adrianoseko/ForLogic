using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using System.Text;
using avaliacao.Data;
using avaliacao.Model;

namespace avaliacao.Repository
{
    /// <summary>
    /// Repository for Avaliacao persistence operations.
    /// This class is responsible only for preparing changes to the DbContext.
    /// SaveChangesAsync must be called by the caller to persist changes.
    /// </summary>
    public class AvaliacaoRepository : IAvaliacaoRepository
    {
        private readonly AvaliacaoContext _context;
        private readonly ILogger<AvaliacaoRepository> _logger;

        public AvaliacaoRepository(AvaliacaoContext context, ILogger<AvaliacaoRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Adds a new Avaliacao to the context. Does not save changes.
        /// </summary>
        public async Task AddAvaliacaoAsync(Avaliacao avaliacao)
        {
            if (avaliacao == null) throw new ArgumentNullException(nameof(avaliacao));

            try
            {
                await _context.AddAsync(avaliacao).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to add Avaliacao.");
                throw;
            }
        }

        /// <summary>
        /// Returns all Avaliacao entries.
        /// </summary>
        public async Task<IEnumerable<Avaliacao>> GetAvaliacoesAsync()
        {
            try
            {
                return await _context.Avaliacao.ToListAsync().ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve Avaliacoes.");
                throw;
            }
        }

        /// <summary>
        /// Returns a single Avaliacao by id or null if not found.
        /// </summary>
        public async Task<Avaliacao?> GetAvaliacaoByIdAsync(int id)
        {
            try
            {
                return await _context.Avaliacao.FirstOrDefaultAsync(x => x.Id == id).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve Avaliacao with id {Id}.", id);
                throw;
            }
        }

        /// <summary>
        /// Marks an Avaliacao for deletion. Does not save changes.
        /// </summary>
        public Task DeleteAvaliacaoAsync(Avaliacao avaliacao)
        {
            if (avaliacao == null) throw new ArgumentNullException(nameof(avaliacao));

            try
            {
                _context.Remove(avaliacao);
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete Avaliacao with id {Id}.", avaliacao?.Id);
                throw;
            }
        }

        /// <summary>
        /// Marks an Avaliacao as modified. Does not save changes.
        /// </summary>
        public Task EditAvaliacaoAsync(Avaliacao avaliacao)
        {
            if (avaliacao == null) throw new ArgumentNullException(nameof(avaliacao));

            try
            {
                _context.Update(avaliacao);
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update Avaliacao with id {Id}.", avaliacao?.Id);
                throw;
            }
        }

        /// <summary>
        /// Persists changes to the database and returns true if any rows were affected.
        /// </summary>
        public async Task<bool> SaveChangesAsync()
        {
            try
            {
                return await _context.SaveChangesAsync().ConfigureAwait(false) > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save changes to the database.");
                throw;
            }
        }
    }

    /// <summary>
    /// Centralized role and policy constants to be used by controllers and authorization configuration.
    /// </summary>
    public static class RolePolicies
    {
        public const string AdminRole = "Admin";
        public const string AdminPolicy = "RequireAdmin";
    }

    /// <summary>
    /// Extension helpers to register authentication, authorization and CORS in Startup/Program.
    /// These helpers enforce secure defaults and require configuration values for production.
    /// Place these calls in your Program.cs/Startup.cs. Example:
    /// services.AddJwtAuthenticationAndAuthorization(Configuration);
    /// services.AddCorsPolicies(Configuration, isProduction: env.IsProduction());
    /// Also, apply [Authorize(Policy = RolePolicies.AdminPolicy)] on controller actions as needed.
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        private const string CorsPolicyName = "DefaultCors";

        public static IServiceCollection AddJwtAuthenticationAndAuthorization(this IServiceCollection services, IConfiguration configuration)
        {
            if (services == null) throw new ArgumentNullException(nameof(services));
            if (configuration == null) throw new ArgumentNullException(nameof(configuration));

            var jwtSection = configuration.GetSection("Jwt");
            var secret = jwtSection.GetValue<string>("Key");

            if (string.IsNullOrWhiteSpace(secret))
                throw new InvalidOperationException("JWT configuration is missing. Please configure Jwt:Key in configuration.");

            var key = Encoding.UTF8.GetBytes(secret);

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
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSection.GetValue<string>("Issuer"),
                    ValidAudience = jwtSection.GetValue<string>("Audience"),
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };
            });

            services.AddAuthorization(options =>
            {
                options.AddPolicy(RolePolicies.AdminPolicy, policy => policy.RequireRole(RolePolicies.AdminRole));
            });

            return services;
        }

        /// <summary>
        /// Adds a named CORS policy. In production this requires explicit allowed origins configured.
        /// In development it allows local usage but still exposes a single named policy to be used by the app.
        /// </summary>
        public static IServiceCollection AddCorsPolicies(this IServiceCollection services, IConfiguration configuration, bool isProduction)
        {
            if (services == null) throw new ArgumentNullException(nameof(services));
            if (configuration == null) throw new ArgumentNullException(nameof(configuration));

            var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();

            if (isProduction && (allowedOrigins == null || allowedOrigins.Length == 0))
            {
                // In production we must not allow all origins. Require explicit configuration.
                throw new InvalidOperationException("CORS allowed origins must be configured for production. Configure Cors:AllowedOrigins in configuration.");
            }

            services.AddCors(options =>
            {
                options.AddPolicy(CorsPolicyName, builder =>
                {
                    if (isProduction)
                    {
                        builder.WithOrigins(allowedOrigins)
                               .AllowAnyHeader()
                               .AllowAnyMethod()
                               .AllowCredentials();
                    }
                    else
                    {
                        // Development: allow local hosts but keep it explicit here instead of AllowAnyOrigin in production.
                        builder.SetIsOriginAllowed(_ => true)
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
