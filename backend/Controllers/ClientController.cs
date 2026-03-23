using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using client.Model;
using client.Repository;

namespace client.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // This controller requires a named CORS policy to be configured in Startup/Program.
    // Configure a restrictive policy for production (allowed origins) and a relaxed one for development.
    [EnableCors("DefaultCorsPolicy")]
    // Require authentication by default for this controller. Method-level role policies are applied below.
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ClientController : ControllerBase
    {
        private readonly IClientRepository _repository;
        private readonly ILogger<ClientController> _logger;

        public ClientController(IClientRepository repository, ILogger<ClientController> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Returns all clients. If none found returns NoContent.
        /// Accessible to Admin and User roles.
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> GetAllClientsAsync()
        {
            try
            {
                var clients = await _repository.BuscaClients();
                return clients != null && clients.Any() ? Ok(clients) : NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching all clients.");
                // Preserve prior behavior of returning 500 for unexpected failures.
                return StatusCode(500, "An unexpected error occurred.");
            }
        }

        /// <summary>
        /// Returns a client by CNPJ. If not found returns NoContent.
        /// Accessible to Admin and User roles.
        /// </summary>
        [HttpGet("{cnpj}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> GetClientByCnpjAsync(int cnpj)
        {
            try
            {
                var client = await _repository.BuscaClient(cnpj);
                return client != null ? Ok(client) : NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching client with CNPJ {Cnpj}.", cnpj);
                return StatusCode(500, "An unexpected error occurred.");
            }
        }

        /// <summary>
        /// Updates a client. Requires Admin role.
        /// </summary>
        [HttpPatch("{cnpj}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateClientAsync(int cnpj, [FromBody] Client client)
        {
            if (client == null)
            {
                return BadRequest("Client data is required.");
            }

            try
            {
                var existingClient = await _repository.BuscaClient(cnpj);
                if (existingClient == null)
                {
                    return NotFound("Client not found.");
                }

                _repository.EditClient(client);
                return await SaveChangesAsync("Error updating client.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating client with CNPJ {Cnpj}.", cnpj);
                return StatusCode(500, "An unexpected error occurred.");
            }
        }

        /// <summary>
        /// Deletes a client. Requires Admin role.
        /// </summary>
        [HttpDelete("{cnpj}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteClientAsync(int cnpj)
        {
            try
            {
                var existingClient = await _repository.BuscaClient(cnpj);
                if (existingClient == null)
                {
                    return NotFound("Client not found.");
                }

                _repository.DeleteClient(existingClient);
                return await SaveChangesAsync("Error deleting client.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while deleting client with CNPJ {Cnpj}.", cnpj);
                return StatusCode(500, "An unexpected error occurred.");
            }
        }

        /// <summary>
        /// Creates a new client. Requires Admin role.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateClientAsync([FromBody] Client client)
        {
            if (client == null)
            {
                return BadRequest("Client data is required.");
            }

            try
            {
                var existingClient = await _repository.BuscaClient(client.Cnpj);
                if (existingClient != null)
                {
                    return Conflict("Client already registered.");
                }

                _repository.AddClient(client);
                return await SaveChangesAsync("Error saving client.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating a client (CNPJ: {Cnpj}).", client?.Cnpj);
                return StatusCode(500, "An unexpected error occurred.");
            }
        }

        /// <summary>
        /// Helper to persist repository changes. On failure returns BadRequest with the provided message.
        /// </summary>
        private async Task<IActionResult> SaveChangesAsync(string errorMessage)
        {
            try
            {
                var saveResult = await _repository.SaveChangeAsync();
                return saveResult ? Ok() : BadRequest(errorMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while saving changes to the repository.");
                return StatusCode(500, "An unexpected error occurred.");
            }
        }
    }
}
