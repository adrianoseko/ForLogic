using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using user.Repository;
using users.Model;

namespace users.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _repository;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserRepository repository, ILogger<UsersController> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // Note: Authentication (JWT) and role-based authorization are applied at the controller level.
        // The Login endpoint below is left open (AllowAnonymous).
        // CORS should be configured in Startup/Program with environment-specific policies (restrict origins in production).

        [HttpGet]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> GetAllUsersAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var users = await _repository.BuscaUsers();

                if (users == null || !users.Any())
                {
                    return NoContent();
                }

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching all users.");
                return StatusCode(500, "An error occurred while processing the request.");
            }
        }

        [HttpGet("{login}/{senha}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserByCredentialsAsync(string login, string senha, CancellationToken cancellationToken = default)
        {
            try
            {
                var user = await _repository.BuscaUser(login, senha);
                return user != null ? Ok(user) : NotFound("Usuário Não Encontrado");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching user by credentials for login {Login}.", login);
                return StatusCode(500, "An error occurred while processing the request.");
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUserAsync([FromBody] Users user, CancellationToken cancellationToken = default)
        {
            if (user == null)
            {
                return BadRequest("User data is required.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _repository.AddUser(user);
                bool isSaved = await _repository.SaveChangeAsync();
                return isSaved ? Ok("Salvo") : BadRequest("Erro ao salvar o usuário.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while creating a user.");
                return StatusCode(500, "An error occurred while processing the request.");
            }
        }
    }
}
