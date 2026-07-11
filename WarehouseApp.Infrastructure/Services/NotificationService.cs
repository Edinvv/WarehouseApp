using Microsoft.AspNetCore.SignalR;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Infrastructure.Hubs;

namespace WarehouseApp.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    public NotificationService(IHubContext<NotificationHub> hubContext) => _hubContext = hubContext;

    public async Task SendToUserAsync(string userId, string message, string type, string? metadata = null)
        => await _hubContext.Clients.Group(userId).SendAsync("ReceiveNotification", message, type, metadata);

    public async Task SendToAllAsync(string message, string type)
        => await _hubContext.Clients.All.SendAsync("ReceiveNotification", message, type, null);
        public async Task SendToRoleAsync(string role, string message, string type, string? metadata = null)
        => await _hubContext.Clients.Group($"role:{role}").SendAsync("ReceiveNotification",message,type,metadata);
}