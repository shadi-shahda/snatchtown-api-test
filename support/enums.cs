namespace LuckyCrush.Domain.Constants;

public enum GlobalTypeCategory
{
    Currency,   // Coins, Diamonds
    Booster,    // Tools, Bombs, Hearts, etc.
    Tool,       // Special tools
    WheelPrize  // Prizes from the wheel
}

public enum TaskType
{
    DestroyRocks,
    DestroyBoxes,
    DestroyIce,
    ActivateFire,
    ActivateBomb,
    DestroyCandies,
    BuyExtraMoves,
    DestroyCandyHorse,
    DestroyCooler,
    DestroyUrchin,
    DailyLogin,
    WinStreak,
    UseSpinner,
    DestroyGemColor,
    DestroyFirework,
    CollectStars,
    CompleteLevels,
    UseBooster,
    UseTools,
    CompleteLevelsWithMoves
}

public enum LevelDifficulty
{
    Easy,
    Normal,
    Hard,
    Limited
}

public enum WheelType
{
    Daily,
    Premium,
    Golden
}

public enum Currency
{
    SyrianPound,
    Dollar,
    Coin,
    Diamond
}
public enum NotificationChannel
{
    Push = 0,
    Email = 1,
}

public enum TaskStatus
{
    Locked,
    Active,
    Completed
}

public enum RoyalPassSubscriptionType
{
    Daily,
    Weekly,
    Monthly,
}

public enum SpinnablePerType
{
    Hour,
    Day,
    Week,
    Month,
    Yearly
}

public enum RedeemableType
{
    RoyalPass,
    Diamond
}

public enum ClaimablePerType
{
    Daily,
}