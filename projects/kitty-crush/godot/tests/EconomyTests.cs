using Whiskerfolk.Economy;
using Xunit;

namespace Whiskerfolk.Tests;

public class EconomyTests
{
    [Fact]
    public void WalletNeverSpendsMoreThanOwned()
    {
        var wallet = new Wallet();
        wallet.Grant(CurrencyKind.Soft, 100);

        Assert.False(wallet.TrySpend(CurrencyKind.Soft, 101));
        Assert.Equal(100, wallet.Soft);

        Assert.True(wallet.TrySpend(CurrencyKind.Soft, 40));
        Assert.Equal(60, wallet.Soft);
    }

    [Fact]
    public void NegativeTransactionsAreRejected()
    {
        var wallet = new Wallet();
        wallet.Grant(CurrencyKind.Premium, -10);
        Assert.Equal(0, wallet.Premium);
        Assert.False(wallet.TrySpend(CurrencyKind.Premium, -1));
    }
}
