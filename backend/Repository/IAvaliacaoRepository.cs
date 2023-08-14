using avaliacao.Model;

namespace avaliacao.Repository
{
    public interface IAvaliacaoRepository
    {
        Task<IEnumerable<Avaliacao>> BuscaAvaliacoes();
        Task<Avaliacao> BuscaAvaliacao(int id);
        void AddAvaliacao(Avaliacao avaliacao);
        void EditAvaliacao(Avaliacao avaliacao);
        void DeleteAvaliacao(Avaliacao avaliacao);

        public Task<bool> SaveChangeAsync();
    }
}