using avaliacao.Data;
using avaliacao.Model;
using Microsoft.EntityFrameworkCore;

namespace avaliacao.Repository
{
    public class AvaliacaoRepository : IAvaliacaoRepository
    {
        private readonly AvaliacaoContext context;
        public AvaliacaoRepository(AvaliacaoContext context)
        {
            this.context = context; // Initialize the context in the constructor
        }
        public void AddAvaliacao(Avaliacao avaliacao)
        {
            this.context.Add(avaliacao);
        }

        public async Task<IEnumerable<Avaliacao>> BuscaAvaliacoes()
        {
            return await this.context.Avaliacao.ToListAsync();
        }
        public async Task<Avaliacao> BuscaAvaliacao(int id)
        {
            return await this.context.Avaliacao.FirstOrDefaultAsync(x => x.Id == id);
        }
        public void DeleteAvaliacao(Avaliacao avaliacao)
        {
            throw new NotImplementedException();
        }

        public void EditAvaliacao(Avaliacao avaliacao)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> SaveChangeAsync()
        {
            return await this.context.SaveChangesAsync() > 0;
        }


    }
}