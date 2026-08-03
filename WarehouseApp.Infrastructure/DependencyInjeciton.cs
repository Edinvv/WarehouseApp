using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Infrastructure.Persistence;
using WarehouseApp.Infrastructure.Services;
namespace WarehouseApp.Infrastructure;

   public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
    {
        // register things here
        services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        services.AddSignalR();
        services.AddScoped<INotificationService, NotificationService>();
        return services;
    }
}
