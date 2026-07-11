namespace WarehouseApp.Application.Common.Interfaces;

public interface INotificationService
{
    Task SendToUserAsync(string userId, string message, string type, string? metadata = null);
    Task SendToAllAsync(string message, string type);

    Task SendToRoleAsync(string role, string message, string type, string? metadata = null);
}