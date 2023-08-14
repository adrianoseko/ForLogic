using Microsoft.AspNetCore.Mvc;
using client.Repository;
using client.Model;

namespace client.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class ClientController : ControllerBase
    {
        private readonly IClientRepository repository;

        public ClientController(IClientRepository repository)
        {
            this.repository = repository;
        }

        [HttpGet]

        public async Task<IActionResult> GetAsync()
        {
            var client = await this.repository.BuscaClients();
            return client.Any() ? Ok(client) : NoContent();
        }


        [HttpGet("{cnpj}")]

        public async Task<IActionResult> GetById(int cnpj)
        {
            var client = await this.repository.BuscaClient(cnpj);
            return client != null ? Ok(client) : NoContent();
        }

        [HttpPatch("{cnpj}")]

        public async Task<IActionResult> Patch(int id, Client client)
        {
            var clientdb = await this.repository.BuscaClient(id);
            if (clientdb == null)
                return NotFound("Usuario Não Encontrado");
            this.repository.EditClient(client);

            return await this.repository.SaveChangeAsync() ? Ok("Salvo") : BadRequest("Erro");

        }

        [HttpDelete("{cnpj}")]

        public async Task<IActionResult> Delete(int cnpj)
        {
            var clientdb = await this.repository.BuscaClient(cnpj);
            if (clientdb == null) return NotFound("Usuario Não Encontrado");



            this.repository.DeleteClient(clientdb);

            return await this.repository.SaveChangeAsync() ? Ok("Deletado") : BadRequest("Erro");

        }

        [HttpPost]

        public async Task<IActionResult> Post(Client client)
        {
            var clientdb = await this.repository.BuscaClient(client.Cnpj);
            if (clientdb != null)
            {
                return Conflict("Cliente Já Cadastrado"); // Return 409 Conflict status code for an existing client
            }

            this.repository.AddClient(client);
            var saveResult = await this.repository.SaveChangeAsync();

            if (saveResult)
            {
                return Ok(clientdb); // Return the added client object
            }
            else
            {
                return BadRequest("Erro ao salvar");
            }





        }
    }
}
