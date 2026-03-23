using System;

namespace Avaliacao.Model
{
    /// <summary>
    /// Representa uma avaliação de cliente.
    /// </summary>
    public interface IAvaliacao
    {
        int Id { get; }
        DateTime DataAvaliacao { get; }
        int ClientId { get; }
        int Nota { get; }
        string Motivo { get; }

        void UpdateNota(int novaNota, string novoMotivo);
    }

    /// <summary>
    /// Entidade Avaliacao.
    /// Mantém a mesma funcionalidade pública do código original, com melhorias de legibilidade
    /// e pequenas extrações para validação reutilizável.
    /// </summary>
    public sealed class Avaliacao : IAvaliacao, IEquatable<Avaliacao>
    {
        public int Id { get; private set; }
        public DateTime DataAvaliacao { get; private set; }
        public int ClientId { get; private set; }
        public int Nota { get; private set; }
        public string Motivo { get; private set; }

        public Avaliacao(int id, DateTime dataAvaliacao, int clientId, int nota, string motivo)
        {
            Id = id;
            DataAvaliacao = dataAvaliacao;
            ClientId = clientId;
            Nota = nota;
            Motivo = motivo;
        }

        /// <summary>
        /// Atualiza a nota e o motivo associados à avaliação.
        /// Mantém a mesma validação de intervalo (0..10) do código original.
        /// </summary>
        /// <param name="novaNota">Nova nota (0-10).</param>
        /// <param name="novoMotivo">Novo motivo/descrição.</param>
        public void UpdateNota(int novaNota, string novoMotivo)
        {
            // Preserva exatamente o comportamento original ao lançar ArgumentOutOfRangeException
            // com o mesmo nome de parâmetro e mensagem.
            Guard.EnsureNotaInRange(novaNota, paramName: nameof(novaNota));

            Nota = novaNota;
            Motivo = novoMotivo;
        }

        public override string ToString() => $"Avaliacao {{ Id = {Id}, ClientId = {ClientId}, Nota = {Nota} }}";

        public bool Equals(Avaliacao other)
        {
            if (ReferenceEquals(null, other)) return false;
            if (ReferenceEquals(this, other)) return true;
            return Id == other.Id;
        }

        public override bool Equals(object obj) => Equals(obj as Avaliacao);

        public override int GetHashCode() => Id.GetHashCode();
    }

    internal static class Guard
    {
        /// <summary>
        /// Valida se a nota está dentro do intervalo permitido.
        /// Usa o nome de parâmetro por padrão "novaNota" para preservar comportamento/assinatura
        /// de exceção do código original.
        /// </summary>
        /// <param name="nota">Valor a validar.</param>
        /// <param name="paramName">Nome do parâmetro a ser usado na exceção (padrão: "novaNota").</param>
        public static void EnsureNotaInRange(int nota, string paramName = "novaNota")
        {
            if (nota < 0 || nota > 10)
            {
                throw new ArgumentOutOfRangeException(paramName, "Nota deve estar entre 0 e 10.");
            }
        }
    }
}
