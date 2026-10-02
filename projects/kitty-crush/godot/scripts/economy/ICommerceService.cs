using System.Threading.Tasks;

namespace Whiskerfolk.Economy;

public interface ICommerceService
{
    Task<bool> IsAvailableAsync();
    Task<PurchaseResult> PurchaseAsync(string productId);
    Task RestoreAsync();
}

public sealed record PurchaseResult(bool Success, string ProductId, string? Error = null);

public sealed class DisabledCommerceService : ICommerceService
{
    public Task<bool> IsAvailableAsync() => Task.FromResult(false);

    public Task<PurchaseResult> PurchaseAsync(string productId) =>
        Task.FromResult(new PurchaseResult(false, productId, "Commerce is intentionally disabled in the vertical slice."));

    public Task RestoreAsync() => Task.CompletedTask;
}
