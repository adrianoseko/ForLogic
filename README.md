# ForLogic

Desafio Forlogic (C# e Angular)

Resumo

Este repositório contém um desafio em C# (ASP.NET Core) e Angular. Antes de acessar o sistema, é necessário garantir que exista pelo menos um usuário na tabela de usuários (users).

Objetivo imediato

- Inserir um login e senha na tabela "users" para poder acessar o sistema.

Recomendações de segurança (importante!)

- Nunca armazene senhas em texto simples. Sempre armazene um hash seguro (ex.: bcrypt, Argon2) com salt.
- Em produção, não use "AllowAll" em CORS — restrinja a origens confiáveis.
- Proteja chaves e segredos (JWT signing keys, connection strings) usando variáveis de ambiente ou serviços de secret management.

Exemplo de script SQL (apenas ilustração)

-- NÃO coloque senhas em texto puro em produção.
-- Substitua '<hashed_password>' pelo resultado de um algoritmo de hashing seguro.

INSERT INTO users (username, password_hash, role, created_at)
VALUES ('admin', '<hashed_password>', 'Admin', NOW());

Como criar o primeiro usuário (sugestões)

1. Use uma ferramenta como DBeaver, pgAdmin, SQL Server Management Studio ou um script de migração para inserir um usuário com a senha já hasheada.
2. Opcionalmente, crie um seeder (migration) que verifica se existe algum usuário e, se não, cria um usuário administrativo com senha gerada/hasheada.

Exemplo de seeding (pseudocódigo)

// Pseudocódigo C# para seeding simplificado
// Execute this on application startup (only in development or safely gated)

if (!dbContext.Users.Any()) {
    var passwordHash = PasswordHasher.Hash("ChangeMe@123");
    dbContext.Users.Add(new User {
        Username = "admin",
        PasswordHash = passwordHash,
        Role = "Admin",
        CreatedAt = DateTime.UtcNow
    });
    dbContext.SaveChanges();
}

Autenticação e autorização (recomendações para ASP.NET Core)

1) Armazenar segredo
- Guarde o segredo de assinatura JWT em variáveis de ambiente ou Azure Key Vault / AWS Secrets Manager.

2) Configurar JWT e policies (exemplo para ASP.NET Core 6+ minimal hosting)

// Em appsettings.Development.json
{
  "Jwt": {
    "Issuer": "MyApp",
    "Audience": "MyAppUsers"
  },
  "Cors": {
    "AllowedOrigins": [ "https://localhost:4200" ]
  }
}

// Em appsettings.Production.json
{
  "Jwt": {
    "Issuer": "MyApp",
    "Audience": "MyAppUsers"
  },
  "Cors": {
    "AllowedOrigins": [ "https://app.example.com" ]
  }
}

// Program.cs (exemplo resumido)
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? throw new InvalidOperationException("JWT_SECRET not set");
var key = Encoding.UTF8.GetBytes(jwtSecret);

// Configure CORS with environment-aware origins
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCors", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Authentication
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
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// Authorization with role-based policy
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy => policy.RequireRole("Admin"));
});

builder.Services.AddControllers();
var app = builder.Build();

if (app.Environment.IsDevelopment()) {
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseCors("DefaultCors");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

3) Proteger endpoints com roles

// Exemplo de Controller
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin")] // apenas Admin pode acessar
    public IActionResult GetAllUsers() {
        // ...
        return Ok();
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public IActionResult Login([FromBody] LoginDto dto) {
        // validar usuário, gerar JWT e retornar
        return Ok();
    }
}

4) Gerar e validar JWT

- Ao autenticar um usuário (login), valide a senha usando o mesmo algoritmo de hashing aplicado no banco.
- Gere um JWT com claims mínimos (sub, role, exp) e assine usando o segredo seguro.

Exemplo simplificado de geração de token (pseudocódigo)

var claims = new[] {
    new Claim(ClaimTypes.Name, user.Username),
    new Claim(ClaimTypes.Role, user.Role)
};

var token = new JwtSecurityToken(
    issuer: config["Jwt:Issuer"],
    audience: config["Jwt:Audience"],
    claims: claims,
    expires: DateTime.UtcNow.AddHours(2),
    signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
);

var jwt = new JwtSecurityTokenHandler().WriteToken(token);

Notas finais

- Para desenvolvimento local, permita origins limitadas (por exemplo https://localhost:4200) e use appsettings.Development.json.
- Em produção, NUNCA use AllowAll for CORS; carregue a lista de origens confiáveis da configuração segura.
- Considere adicionar proteção adicional como refresh tokens, rate limiting e MFA para contas administrativas.

Contato

Se precisar de ajuda para implementar o seeding, JWT ou configurar CORS/roles, responda neste repositório com detalhes do seu projeto (versão do .NET, banco de dados) e eu posso fornecer exemplos específicos.
