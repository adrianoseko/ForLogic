using Microsoft.AspNetCore.Mvc;
using avaliacao.Repository;
using avaliacao.Model;

namespace avaliacao.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class AvaliacaoController : ControllerBase
    {
        private readonly IAvaliacaoRepository repository;

        public AvaliacaoController(IAvaliacaoRepository repository)
        {
            this.repository = repository;
        }

        [HttpGet]

        public async Task<IActionResult> Get()
        {
            var avaliacoes = await this.repository.BuscaAvaliacoes();
            return avaliacoes.Any() ? Ok(avaliacoes) : NoContent();
        }

        [HttpGet("{id}")]

        public async Task<IActionResult> GetById(int id)
        {
            var user = await this.repository.BuscaAvaliacao(id);
            return user != null ? Ok(user) : NoContent();
        }


        [HttpPost]
        public async Task<IActionResult> Post(Avaliacao avaliacao)
        {
            var avaliacaoDb = this.repository.BuscaAvaliacoes();
            DateTime dataAvaliacaoDate = Convert.ToDateTime(avaliacao.DataAvaliacao);
            int mes = dataAvaliacaoDate.Month;
            int ano = dataAvaliacaoDate.Year;
            foreach (var avaliacaoAtual in await avaliacaoDb)
            {
                var dataDB = Convert.ToDateTime(avaliacaoAtual.DataAvaliacao);
                int mesDB = dataDB.Month;
                int anoDb = dataDB.Year;

                if (mes == mesDB && ano == anoDb && avaliacao.Client == avaliacaoAtual.Client)
                {
                    return Ok("Cliente já fez uma avaliação esse mês!");
                }
            }

            this.repository.AddAvaliacao(avaliacao);
            return await this.repository.SaveChangeAsync() ? Ok("Salvo") : BadRequest("Erro");
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Patch(int id, Avaliacao avaliacao)
        {
            var userdb = await this.repository.BuscaAvaliacao(id);
            if (userdb == null) return NotFound("Usuario Não Encontrado");


            this.repository.EditAvaliacao(avaliacao);

            return await this.repository.SaveChangeAsync() ? Ok("Salvo") : BadRequest("Erro");

        }

        [HttpDelete("{id}")]

        public async Task<IActionResult> Delete(int id)
        {
            var userdb = await this.repository.BuscaAvaliacao(id);
            if (userdb == null) return NotFound("Usuario Não Encontrado");



            this.repository.DeleteAvaliacao(userdb);

            return await this.repository.SaveChangeAsync() ? Ok("Deletado") : BadRequest("Erro");

        }


    }
}