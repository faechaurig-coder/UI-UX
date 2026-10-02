using System.Collections.Generic;

namespace Whiskerfolk.Economy;

public enum CurrencyKind
{
    Soft,
    Premium
}

public enum CatalogCategory
{
    Home,
    Style,
    MemoryPresentation
}

public sealed record CatalogItem(
    string Id,
    string DisplayName,
    CatalogCategory Category,
    CurrencyKind Currency,
    int Price,
    bool Interactive,
    IReadOnlySet<string> Tags
);

public sealed class Wallet
{
    public int Soft { get; private set; }
    public int Premium { get; private set; }

    public void Grant(CurrencyKind kind, int amount)
    {
        if (amount <= 0) return;
        if (kind == CurrencyKind.Soft) Soft += amount;
        else Premium += amount;
    }

    public bool TrySpend(CurrencyKind kind, int amount)
    {
        if (amount < 0) return false;

        if (kind == CurrencyKind.Soft)
        {
            if (Soft < amount) return false;
            Soft -= amount;
            return true;
        }

        if (Premium < amount) return false;
        Premium -= amount;
        return true;
    }
}
