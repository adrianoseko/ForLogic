using Microsoft.AspNetCore.Mvc;
using client.Repository;
using client.Model;
using System.Threading.Tasks;
using System.Linq;

namespace client.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientController : ControllerBase
    {
        private readonly IClientRepository _repository;

        public ClientController(IClientRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllClientsAsync()
        {
            var clients = await _repository.BuscaClients();
            return clients.Any() ? Ok(clients) : NoContent();
        }

        [HttpGet("{cnpj}")]
        public async Task<IActionResult> GetClientByCnpjAsync(int cnpj)
        {
            var client = await _repository.BuscaClient(cnpj);
            return client != null ? Ok(client) : NoContent();
        }

        [HttpPatch("{cnpj}")]
        public async Task<IActionResult> UpdateClientAsync(int cnpj, Client client)
        {
            if (client == null)
            {
                return BadRequest("Client data is required.");
            }

            var existingClient = await _repository.BuscaClient(cnpj);
            if (existingClient == null)
            {
                return NotFound("Client not found.");
            }

            _repository.EditClient(client);
            return await SaveChangesAsync("Error updating client.");
        }

        [HttpDelete("{cnpj}")]
        public async Task<IActionResult> DeleteClientAsync(int cnpj)
        {
            var existingClient = await _repository.BuscaClient(cnpj);
            if (existingClient == null)
            {
                return NotFound("Client not found.");
            }

            _repository.DeleteClient(existingClient);
            return await SaveChangesAsync("Error deleting client.");
        }

        [HttpPost]
        public async Task<IActionResult> CreateClientAsync(Client client)
        {
            if (client == null)
            {
                return BadRequest("Client data is required.");
            }

            var existingClient = await _repository.BuscaClient(client.Cnpj);
            if (existingClient != null)
            {
                return Conflict("Client already registered.");
            }

            _repository.AddClient(client);
            return await SaveChangesAsync("Error saving client.");
        }

        private async Task<IActionResult> SaveChangesAsync(string errorMessage)
        {
            var saveResult = await _repository.SaveChangeAsync();
            return saveResult ? Ok() : BadRequest(errorMessage);
        }
    }
}