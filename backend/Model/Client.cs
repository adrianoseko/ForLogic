using System;
#nullable enable

namespace Client.Model
{
    /// <summary>
    /// Represents a client entity in the domain.
    /// This class is intentionally mutable via UpdateClientInfo to preserve existing behavior.
    /// </summary>
    public interface IClient
    {
        int Id { get; }
        string Name { get; }
        string ResponsiblePerson { get; }
        string Cnpj { get; }
        DateTime RegistrationDate { get; }
        string ClientType { get; }

        /// <summary>
        /// Updates the mutable client information (name, responsible person and client type).
        /// </summary>
        /// <param name="name">The new name for the client.</param>
        /// <param name="responsiblePerson">The new responsible person for the client.</param>
        /// <param name="clientType">The new client type.</param>
        void UpdateClientInfo(string name, string responsiblePerson, string clientType);
    }

    /// <summary>
    /// Concrete implementation of IClient.
    /// Kept behavior-compatible with the original implementation (same constructor and update method signatures).
    /// </summary>
    public sealed class Client : IClient
    {
        /// <summary>
        /// Unique identifier for the client.
        /// </summary>
        public int Id { get; private set; }

        /// <summary>
        /// Client display name.
        /// </summary>
        public string Name { get; private set; }

        /// <summary>
        /// Name of the person responsible for the client.
        /// </summary>
        public string ResponsiblePerson { get; private set; }

        /// <summary>
        /// Client CNPJ (Brazilian identifier) as stored.
        /// </summary>
        public string Cnpj { get; private set; }

        /// <summary>
        /// Date when the client was registered.
        /// </summary>
        public DateTime RegistrationDate { get; private set; }

        /// <summary>
        /// Business/client type descriptor.
        /// </summary>
        public string ClientType { get; private set; }

        /// <summary>
        /// Constructs a new client instance.
        /// This constructor preserves the original parameter order and assignments to remain behaviour-compatible.
        /// </summary>
        public Client(int id, string name, string responsiblePerson, string cnpj, DateTime registrationDate, string clientType)
        {
            Id = id;
            Name = name;
            ResponsiblePerson = responsiblePerson;
            Cnpj = cnpj;
            RegistrationDate = registrationDate;
            ClientType = clientType;
        }

        /// <summary>
        /// Updates the client's mutable fields: Name, ResponsiblePerson and ClientType.
        /// Note: This mirrors the original behavior and does not perform additional validation to avoid changing existing behavior.
        /// </summary>
        public void UpdateClientInfo(string name, string responsiblePerson, string clientType)
        {
            Name = name;
            ResponsiblePerson = responsiblePerson;
            ClientType = clientType;
        }

        /// <summary>
        /// Provides a readable string representation useful for logging and debugging.
        /// </summary>
        public override string ToString()
        {
            return $"Client {{ Id = {Id}, Name = {Name}, ResponsiblePerson = {ResponsiblePerson}, Cnpj = {Cnpj}, RegistrationDate = {RegistrationDate:O}, ClientType = {ClientType} }}";
        }
    }
}
