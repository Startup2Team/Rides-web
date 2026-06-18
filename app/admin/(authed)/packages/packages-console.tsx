"use client";

import { useEffect, useState } from "react";
import { getAdminPackages, createPackage, updatePackage, togglePackage, deletePackage, type Package } from "@/lib/api";

const VEHICLE_TYPES = [
  { code: "MOTO_BIKE", name: "Moto" },
  { code: "CAB_TAXI", name: "Cab" },
  { code: "HEAVY_FUSO", name: "Heavy Fuso" },
  { code: "LIGHT_HILUX", name: "Light Hilux" },
  { code: "TUK_TUK", name: "Tuk Tuk" },
];

export function PackagesConsole() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  // Form states (Create)
  const [name, setName] = useState("");
  const [vehicleTypeCode, setVehicleTypeCode] = useState(VEHICLE_TYPES[0].code);
  const [rideCount, setRideCount] = useState<number | "">(10);
  const [bonusRides, setBonusRides] = useState<number | "">(0);
  const [validityDays, setValidityDays] = useState<number | "">(30);
  const [priceRWF, setPriceRWF] = useState<number | "">(1000);
  const [isPromotional, setIsPromotional] = useState(false);

  // Form states (Edit)
  const [editName, setEditName] = useState("");
  const [editRideCount, setEditRideCount] = useState<number | "">(10);
  const [editBonusRides, setEditBonusRides] = useState<number | "">(0);
  const [editValidityDays, setEditValidityDays] = useState<number | "">(30);
  const [editPriceRWF, setEditPriceRWF] = useState<number | "">(1000);

  const fetchPackages = () => {
    setLoading(true);
    setError(null);
    getAdminPackages()
      .then((data) => {
        setPackages(data ?? []);
      })
      .catch((err) => {
        setError(err.message || "Failed to load packages");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createPackage({
      name,
      vehicle_type_code: vehicleTypeCode,
      ride_count: Number(rideCount) || 1,
      bonus_rides: Number(bonusRides) || 0,
      validity_days: Number(validityDays) || 30,
      price_rwf: Number(priceRWF) || 0,
      is_promotional: isPromotional,
    })
      .then(() => {
        setCreateOpen(false);
        // Reset form
        setName("");
        setVehicleTypeCode(VEHICLE_TYPES[0].code);
        setRideCount(10);
        setBonusRides(0);
        setValidityDays(30);
        setPriceRWF(1000);
        setIsPromotional(false);
        fetchPackages();
      })
      .catch((err) => {
        setError(err.message || "Failed to create package");
      });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;
    setError(null);
    updatePackage(selectedPackage.id, {
      name: editName,
      ride_count: Number(editRideCount) || 1,
      bonus_rides: Number(editBonusRides) || 0,
      validity_days: Number(editValidityDays) || 30,
      price_rwf: Number(editPriceRWF) || 0,
    })
      .then(() => {
        setEditOpen(false);
        setSelectedPackage(null);
        fetchPackages();
      })
      .catch((err) => {
        setError(err.message || "Failed to update package");
      });
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    setError(null);
    togglePackage(id, !currentStatus)
      .then(() => {
        fetchPackages();
      })
      .catch((err) => {
        setError(err.message || "Failed to toggle package status");
      });
  };

  const openEditModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setEditName(pkg.name);
    setEditRideCount(pkg.ride_count);
    setEditBonusRides(pkg.bonus_rides);
    setEditValidityDays(pkg.validity_days);
    setEditPriceRWF(pkg.price_rwf);
    setEditOpen(true);
  };

  const openDeleteConfirm = (pkg: Package) => {
    setSelectedPackage(pkg);
    setDeleteOpen(true);
  };

  const handleDeleteSubmit = () => {
    if (!selectedPackage) return;
    setError(null);
    deletePackage(selectedPackage.id)
      .then(() => {
        setDeleteOpen(false);
        setSelectedPackage(null);
        fetchPackages();
      })
      .catch((err) => {
        setError(err.message || "Failed to delete package");
      });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US").format(price) + " RWF";
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {packages.length} {packages.length === 1 ? "package" : "packages"} configured
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm"
        >
          Create Package
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Packages Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
            Loading packages...
          </div>
        ) : packages.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No ride packages configured yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Vehicle Type</th>
                  <th className="px-4 py-3 text-right">Price (RWF)</th>
                  <th className="px-4 py-3 text-center">Ride Count</th>
                  <th className="px-4 py-3 text-center">Bonus Rides</th>
                  <th className="px-4 py-3 text-center">Total Credits</th>
                  <th className="px-4 py-3 text-center">Validity (Days)</th>
                  <th className="px-4 py-3 text-center">Type</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      {pkg.name}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {VEHICLE_TYPES.find((v) => v.code === pkg.vehicle_type_code)?.name || pkg.vehicle_type_code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-foreground">
                      {formatPrice(pkg.price_rwf)}
                    </td>
                    <td className="px-4 py-3.5 text-center text-foreground font-mono">
                      {pkg.ride_count}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-emerald-600 dark:text-emerald-500">
                      {pkg.bonus_rides > 0 ? `+${pkg.bonus_rides}` : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-foreground font-mono">
                      {pkg.ride_count + pkg.bonus_rides}
                    </td>
                    <td className="px-4 py-3.5 text-center text-muted-foreground">
                      {pkg.validity_days} days
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {pkg.is_promotional ? (
                        <span className="inline-flex items-center rounded-md bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                          Free Trial
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-sky-400/10 px-2 py-0.5 text-xs font-medium text-sky-600 dark:text-sky-400">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleToggle(pkg.id, pkg.is_active)}
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition-colors ${
                          pkg.is_active
                            ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {pkg.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                     <td className="px-4 py-3.5 text-right space-x-3">
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(pkg)}
                        className="text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground">Create Ride Package</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Define a new prepaid credit pack available for driver purchase.
            </p>

            <form onSubmit={handleCreateSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starter Pack, Heavy Hauler Monthly"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vehicle Type</label>
                  <select
                    value={vehicleTypeCode}
                    onChange={(e) => setVehicleTypeCode(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    {VEHICLE_TYPES.map((vt) => (
                      <option key={vt.code} value={vt.code}>
                        {vt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Price (RWF)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={priceRWF}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setPriceRWF(isNaN(v) ? "" : v);
                    }}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ride Count</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={rideCount}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setRideCount(isNaN(v) ? "" : v);
                    }}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bonus Rides</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={bonusRides}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setBonusRides(isNaN(v) ? "" : v);
                    }}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none font-mono text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Validity (Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={validityDays}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setValidityDays(isNaN(v) ? "" : v);
                    }}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="promo"
                  type="checkbox"
                  checked={isPromotional}
                  onChange={(e) => setIsPromotional(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                />
                <label htmlFor="promo" className="text-sm font-medium text-foreground select-none">
                  Mark as Free Trial
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="h-10 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground">Edit Package: {selectedPackage.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Modify the credits, price, or validity window. Updates take effect immediately for new sales.
            </p>

            <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Package Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vehicle Type</label>
                  <input
                    type="text"
                    disabled
                    value={VEHICLE_TYPES.find((v) => v.code === selectedPackage.vehicle_type_code)?.name || selectedPackage.vehicle_type_code}
                    className="w-full h-10 rounded-xl border border-border bg-muted/40 px-3 text-sm text-muted-foreground focus:outline-none cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Price (RWF)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editPriceRWF}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setEditPriceRWF(isNaN(v) ? "" : v);
                    }}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ride Count</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editRideCount}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setEditRideCount(isNaN(v) ? "" : v);
                    }}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bonus Rides</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editBonusRides}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setEditBonusRides(isNaN(v) ? "" : v);
                    }}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none font-mono text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Validity (Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editValidityDays}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setEditValidityDays(isNaN(v) ? "" : v);
                    }}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setEditOpen(false);
                    setSelectedPackage(null);
                  }}
                  className="h-10 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-destructive">Delete Package</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete the package <strong className="text-foreground">"{selectedPackage.name}"</strong>?
            </p>
            <p className="mt-2 text-xs text-muted-foreground bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-3">
              This action will remove the package from sale. Active driver credits purchased from this package will remain unaffected.
            </p>

            <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setDeleteOpen(false);
                  setSelectedPackage(null);
                }}
                className="h-10 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                className="h-10 rounded-xl bg-destructive px-4 text-sm font-semibold text-destructive-foreground hover:bg-destructive/95 transition-all shadow-sm"
              >
                Delete Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
