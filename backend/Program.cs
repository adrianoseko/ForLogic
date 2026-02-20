using Microsoft.EntityFrameworkCore;
using user.Data;
using client.Data;
using avaliacao.Data;
using user.Repository;
using client.Repository;
using avaliacao.Repository;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
ConfigureServices(builder);

var app = builder.Build();

// Configure the HTTP request pipeline.
ConfigureMiddleware(app);

app.Run();

void ConfigureServices(WebApplicationBuilder builder)
{
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    ConfigureDbContexts(builder);
    ConfigureRepositories(builder);
    ConfigureCors(builder);
}

void ConfigureDbContexts(WebApplicationBuilder builder)
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    builder.Services.AddDbContext<UserContext>(options => options.UseSqlServer(connectionString));
    builder.Services.AddDbContext<ClientContext>(options => options.UseSqlServer(connectionString));
    builder.Services.AddDbContext<AvaliacaoContext>(options => options.UseSqlServer(connectionString));
}

void ConfigureRepositories(WebApplicationBuilder builder)
{
    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IClientRepository, ClientRepository>();
    builder.Services.AddScoped<IAvaliacaoRepository, AvaliacaoRepository>();
}

void ConfigureCors(WebApplicationBuilder builder)
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
    });
}

void ConfigureMiddleware(WebApplication app)
{
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();
    app.UseRouting();
    app.UseCors("AllowAll");
    app.UseAuthorization();
    app.MapControllers();
}