using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using user.Repository;
using users.Model;

namespace users.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _repository;

        public UsersController(IUserRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsersAsync()
        {
            var users = await _repository.BuscaUsers();
            return users.Any() ? Ok(users) : NoContent();
        }

        [HttpGet("{login}/{senha}")]
        public async Task<IActionResult> GetUserByCredentialsAsync(string login, string senha)
        {
            var user = await _repository.BuscaUser(login, senha);
            return user != null ? Ok(user) : NotFound("Usuário Não Encontrado");
        }

        [HttpPost]
        public async Task<IActionResult> CreateUserAsync([FromBody] Users user)
        {
            if (user == null)
            {
                return BadRequest("User data is required.");
            }

            _repository.AddUser(user);
            bool isSaved = await _repository.SaveChangeAsync();
            return isSaved ? Ok("Salvo") : BadRequest("Erro ao salvar o usuário.");
        }
    }
}