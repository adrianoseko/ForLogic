using System.Linq;
using Microsoft.AspNetCore.Mvc;
using user.Repository;
using users.Model;

namespace users.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class UsersController : ControllerBase
    {
        private readonly IUserRepository repository;

        public UsersController(IUserRepository repository)
        {
            this.repository = repository;
        }

        [HttpGet]

        public async Task<IActionResult> Get()
        {
            var users = await this.repository.BuscaUsers();
            return users.Any() ? Ok(users) : NoContent();
        }

        [HttpGet("{login}/{senha}")]
        public async Task<IActionResult> Get(string login, string senha)
        {
            var userbd = await this.repository.BuscaUser(login, senha);
            if (userbd == null)
                return NotFound("Usuário Não Encontrado");

            return Ok(userbd); // Retornar o usuário encontrado com uma resposta de sucesso
        }


        [HttpPost]

        public async Task<IActionResult> Post(Users user)
        {
            this.repository.AddUser(user);
            return await this.repository.SaveChangeAsync() ? Ok("Salvo") : BadRequest("Erro");
        }

    }


}