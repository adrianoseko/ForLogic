using Microsoft.AspNetCore.Mvc;
using avaliacao.Repository;
using avaliacao.Model;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace avaliacao.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AvaliacaoController : ControllerBase
    {
        private readonly IAvaliacaoRepository _repository;

        public AvaliacaoController(IAvaliacaoRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAvaliacoes()
        {
            var avaliacoes = await _repository.BuscaAvaliacoes();
            return avaliacoes.Any() ? Ok(avaliacoes) : NoContent();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAvaliacaoById(int id)
        {
            var avaliacao = await _repository.BuscaAvaliacao(id);
            return avaliacao != null ? Ok(avaliacao) : NoContent();
        }

        [HttpPost]
        public async Task<IActionResult> CreateAvaliacao(Avaliacao avaliacao)
        {
            if (await IsClientEvaluationInCurrentMonth(avaliacao))
            {
                return Ok("Cliente já fez uma avaliação esse mês!");
            }

            _repository.AddAvaliacao(avaliacao);
            return await SaveChangesAsync("Salvo");
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateAvaliacao(int id, Avaliacao avaliacao)
        {
            var existingAvaliacao = await _repository.BuscaAvaliacao(id);
            if (existingAvaliacao == null) return NotFound("Usuário Não Encontrado");

            _repository.EditAvaliacao(avaliacao);
            return await SaveChangesAsync("Salvo");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAvaliacao(int id)
        {
            var existingAvaliacao = await _repository.BuscaAvaliacao(id);
            if (existingAvaliacao == null) return NotFound("Usuário Não Encontrado");

            _repository.DeleteAvaliacao(existingAvaliacao);
            return await SaveChangesAsync("Deletado");
        }

        private async Task<bool> IsClientEvaluationInCurrentMonth(Avaliacao avaliacao)
        {
            var avaliacoesDb = await _repository.BuscaAvaliacoes();
            DateTime dataAvaliacaoDate = Convert.ToDateTime(avaliacao.DataAvaliacao);
            int mes = dataAvaliacaoDate.Month;
            int ano = dataAvaliacaoDate.Year;

            return avaliacoesDb.Any(avaliacaoAtual =>
                Convert.ToDateTime(avaliacaoAtual.DataAvaliacao).Month == mes &&
                Convert.ToDateTime(avaliacaoAtual.DataAvaliacao).Year == ano &&
                avaliacao.Client == avaliacaoAtual.Client);
        }

        private async Task<IActionResult> SaveChangesAsync(string successMessage)
        {
            return await _repository.SaveChangeAsync() ? Ok(successMessage) : BadRequest("Erro");
        }
    }
}