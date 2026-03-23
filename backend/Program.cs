using System;
using System.Linq;
using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using user.Data;
using client.Data;
using avaliacao.Data;
using user.Repository;
using client.Repository;
using avaliacao.Repository;

var builder = WebApplication.CreateBuilder(args);

// Configure services and DI
ConfigureServices(builder);

var app = builder.Build();

// Configure request pipeline and middleware
ConfigureMiddleware(app);

app.Run();

static void ConfigureServices(WebApplicationBuilder builder)
{
    // MVC + API documentation
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    // Database contexts
    ConfigureDbContexts(builder);

    // Repositories (Scoped)
    ConfigureRepositories(builder);

    // Authentication & Authorization
    ConfigureAuthenticationAndAuthorization(builder);

    // CORS - separate policies for Development and Production
    ConfigureCors(builder);
}

static void ConfigureDbContexts(WebApplicationBuilder builder)
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        // Keep behavior stable — do not throw here. If missing, EF registrations will still attempt to use null which will fail at runtime.
        builder.Services.AddDbContext<UserContext>(options => { });
        builder.Services.AddDbContext<ClientContext>(options => { });
        builder.Services.AddDbContext<AvaliacaoContext>(options => { });
        return;
    }

    builder.Services.AddDbContext<UserContext>(options => options.UseSqlServer(connectionString));
    builder.Services.AddDbContext<ClientContext>(options => options.UseSqlServer(connectionString));
    builder.Services.AddDbContext<AvaliacaoContext>(options => options.UseSqlServer(connectionString));
}

static void ConfigureRepositories(WebApplicationBuilder builder)
{
    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IClientRepository, ClientRepository>();
    builder.Services.AddScoped<IAvaliacaoRepository, AvaliacaoRepository>();
}

static void ConfigureAuthenticationAndAuthorization(WebApplicationBuilder builder)
{
    // Read JWT settings from configuration. If missing, authentication is not added to avoid breaking existing behavior.
    var jwtKey = builder.Configuration["Jwt:Key"];
    var jwtIssuer = builder.Configuration["Jwt:Issuer"];
    var jwtAudience = builder.Configuration["Jwt:Audience"];

    if (!string.IsNullOrWhiteSpace(jwtKey) && !string.IsNullOrWhiteSpace(jwtIssuer) && !string.IsNullOrWhiteSpace(jwtAudience))
    {
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

        builder.Services.AddAuthentication(options =>
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
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,
                IssuerSigningKey = signingKey,
                ClockSkew = TimeSpan.FromSeconds(30)
            };
        });

        // Add role-based policies that controllers can opt into via [Authorize(Policy = "...")]
        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
            options.AddPolicy("UserOrAdmin", policy => policy.RequireRole("User", "Admin"));
        });
    }
    else
    {
        // Do not add authentication/authorization services if JWT settings are absent.
        // This preserves previous behavior where controllers were accessible without auth.
        builder.Services.AddAuthorization();
    }
}

static void ConfigureCors(WebApplicationBuilder builder)
{
    // Allow configuring allowed origins via configuration: Cors:AllowedOrigins (comma separated) or Cors:AllowedOrigins as an array
    builder.Services.AddCors(options =>
    {
        // Development policy - allows common localhost ports for SPAs during development
        options.AddPolicy("LocalDevelopment", policyBuilder =>
        {
            policyBuilder
                .WithOrigins("http://localhost:3000", "http://localhost:5000", "https://localhost:3001")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });

        // Production policy - locked to configured origins only. If none configured, it will be conservative and allow no origins.
        options.AddPolicy("ProductionOrigins", policyBuilder =>
        {
            var origins = GetConfiguredOrigins(builder.Configuration);
            if (origins != null && origins.Any())
            {
                policyBuilder.WithOrigins(origins)
                             .AllowAnyHeader()
                             .AllowAnyMethod()
                             .AllowCredentials();
            }
            else
            {
                // No origins configured => configure a restrictive policy that allows nothing. This prevents accidental open CORS in prod.
                policyBuilder.WithOrigins(Array.Empty<string>());
            }
        });

        // Backward-compatible permissive policy kept only for explicit use in non-production automatic scenarios (not used in Production by default)
        options.AddPolicy("AllowAllLocalOnly", policyBuilder =>
        {
            policyBuilder.AllowAnyOrigin()
                         .AllowAnyHeader()
                         .AllowAnyMethod();
        });
    });
}

static string[]? GetConfiguredOrigins(IConfiguration configuration)
{
    // Try to read as array first, then fallback to comma-separated list
    var section = configuration.GetSection("Cors:AllowedOrigins");
    var origins = section.Get<string[]?>();
    if (origins != null && origins.Length > 0)
        return origins.Select(o => o?.Trim()).Where(o => !string.IsNullOrEmpty(o)).ToArray();

    var comma = configuration["Cors:AllowedOrigins"];
    if (!string.IsNullOrWhiteSpace(comma))
        return comma.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim())
                    .Where(s => !string.IsNullOrEmpty(s))
                    .ToArray();

    return null;
}

static void ConfigureMiddleware(WebApplication app)
{
    var env = app.Environment;

    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
        app.UseSwagger();
        app.UseSwaggerUI();
    }
    else
    {
        // In production use a global exception handler and HSTS
        app.UseExceptionHandler("/error");
        app.UseHsts();
    }

    app.UseHttpsRedirection();

    app.UseRouting();

    // Select CORS policy depending on environment
    if (env.IsDevelopment())
    {
        app.UseCors("LocalDevelopment");
    }
    else
    {
        // Use production origins policy which is restrictive by default
        app.UseCors("ProductionOrigins");
    }

    // Ensure authentication middleware is placed before authorization. If authentication was not configured, these calls are no-ops.
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
}
