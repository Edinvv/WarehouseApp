using Microsoft.EntityFrameworkCore;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.Infrastructure.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Stock.AnyAsync()) return;

        var cold = await GetOrCreateSector(context, "Cold Storage", "Refrigerated products");
        var dry = await GetOrCreateSector(context, "Dry Goods", "Non-perishable pantry items");
        var bev = await GetOrCreateSector(context, "Beverages", "Drinks and liquids");

        await context.SaveChangesAsync();

        context.Stock.AddRange(
            new Stock { Id = Guid.NewGuid(), SectorId = cold.Id, ProductName = "Butter", Barcode = "COLD-001", Quantity = 80 },
            new Stock { Id = Guid.NewGuid(), SectorId = cold.Id, ProductName = "Milk (1L)", Barcode = "COLD-002", Quantity = 120 },
            new Stock { Id = Guid.NewGuid(), SectorId = cold.Id, ProductName = "Heavy Cream", Barcode = "COLD-003", Quantity = 60 },
            new Stock { Id = Guid.NewGuid(), SectorId = cold.Id, ProductName = "Mozzarella", Barcode = "COLD-004", Quantity = 50 },

            new Stock { Id = Guid.NewGuid(), SectorId = dry.Id, ProductName = "Pasta (500g)", Barcode = "DRY-001", Quantity = 200 },
            new Stock { Id = Guid.NewGuid(), SectorId = dry.Id, ProductName = "Flour (1kg)", Barcode = "DRY-002", Quantity = 150 },
            new Stock { Id = Guid.NewGuid(), SectorId = dry.Id, ProductName = "Rice (1kg)", Barcode = "DRY-003", Quantity = 180 },
            new Stock { Id = Guid.NewGuid(), SectorId = dry.Id, ProductName = "Olive Oil (500ml)", Barcode = "DRY-004", Quantity = 90 },

            new Stock { Id = Guid.NewGuid(), SectorId = bev.Id, ProductName = "Sparkling Water (1L)", Barcode = "BEV-001", Quantity = 300 },
            new Stock { Id = Guid.NewGuid(), SectorId = bev.Id, ProductName = "Orange Juice (1L)", Barcode = "BEV-002", Quantity = 100 },
            new Stock { Id = Guid.NewGuid(), SectorId = bev.Id, ProductName = "Red Wine (750ml)", Barcode = "BEV-003", Quantity = 75 },
            new Stock { Id = Guid.NewGuid(), SectorId = bev.Id, ProductName = "Coffee Beans (250g)", Barcode = "BEV-004", Quantity = 60 }
        );

        await context.SaveChangesAsync();
    }

    private static async Task<Sector> GetOrCreateSector(AppDbContext context, string name, string description)
    {
        var existing = await context.Sectors.FirstOrDefaultAsync(s => s.Name == name);
        if (existing != null) return existing;

        var sector = new Sector { Id = Guid.NewGuid(), Name = name, Description = description };
        context.Sectors.Add(sector);
        return sector;
    }
}