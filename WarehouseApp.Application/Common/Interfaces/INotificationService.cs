namespace WarehouseApp.Application.Common.Interfaces;

public interface INotificationService
{
    Task SendToUserAsync(string userId, string message, string type);
    Task SendToAllAsync(string message, string type);
}