using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace WarehouseApp.Infrastructure.Hubs
{
    public class NotificationHub : Hub
    {
       public override async Task OnConnectedAsync()
        {
                if (Context.UserIdentifier is not null)
            await Groups.AddToGroupAsync(Context.ConnectionId, Context.UserIdentifier);

        await base.OnConnectedAsync();

        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
              if (Context.UserIdentifier is not null)
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, Context.UserIdentifier);

        await base.OnDisconnectedAsync(exception);
        }
    }
}