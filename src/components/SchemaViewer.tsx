import React, { useState } from 'react';
import { 
  Database, 
  Key, 
  Link2, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Layers,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  HeartHandshake,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { SCHEMA_TABLES, TableDef } from '../lib/schema-data';

export const SchemaViewer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTable, setExpandedTable] = useState<string | null>('profiles');

  const filteredTables = SCHEMA_TABLES.filter((table) => {
    const matchesCategory = selectedCategory === 'all' || table.category === selectedCategory;
    const matchesSearch = 
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.columns.some((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: TableDef['category']) => {
    switch (category) {
      case 'core': return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'clinical': return <Stethoscope className="w-4 h-4 text-rose-600" />;
      case 'matching': return <HeartHandshake className="w-4 h-4 text-amber-600" />;
      case 'billing': return <CreditCard className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getCategoryBadgeClass = (category: TableDef['category']) => {
    switch (category) {
      case 'core': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'clinical': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'matching': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'billing': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedCategory === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Tables ({SCHEMA_TABLES.length})
          </button>
          <button
            onClick={() => setSelectedCategory('core')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              selectedCategory === 'core' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Core Identity
          </button>
          <button
            onClick={() => setSelectedCategory('matching')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              selectedCategory === 'matching' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" /> Requests &amp; Matching
          </button>
          <button
            onClick={() => setSelectedCategory('clinical')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              selectedCategory === 'clinical' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Clinical &amp; Health Data
          </button>
          <button
            onClick={() => setSelectedCategory('billing')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              selectedCategory === 'billing' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" /> Billing &amp; Invoices
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter tables, columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table Cards List */}
      <div className="space-y-4">
        {filteredTables.map((table) => {
          const isExpanded = expandedTable === table.id;
          return (
            <div
              key={table.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Header */}
              <div
                onClick={() => setExpandedTable(isExpanded ? null : table.id)}
                className="p-4 flex items-center justify-between cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 hover:text-slate-600">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
                    {getCategoryIcon(table.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{table.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getCategoryBadgeClass(table.category)}`}>
                        {table.category}
                      </span>
                      {table.hipaaCompliant && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> HIPAA/PHI Protected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{table.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="hidden sm:inline-block">
                    <span className="font-semibold text-slate-700">{table.columns.length}</span> columns
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                    RLS Enabled
                  </span>
                </div>
              </div>

              {/* Table Columns Detail */}
              {isExpanded && (
                <div className="border-t border-slate-200 p-4 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50">
                          <th className="py-2.5 px-3 font-semibold">Column Name</th>
                          <th className="py-2.5 px-3 font-semibold">Data Type</th>
                          <th className="py-2.5 px-3 font-semibold">Constraints</th>
                          <th className="py-2.5 px-3 font-semibold">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {table.columns.map((col) => (
                          <tr key={col.name} className="hover:bg-slate-50/70">
                            <td className="py-2 px-3 text-slate-800 font-medium flex items-center gap-1.5">
                              {col.isPrimary && (
                                <span title="Primary Key">
                                  <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                </span>
                              )}
                              {col.isForeign && (
                                <span title={`Foreign Key references ${col.foreignTable}`}>
                                  <Link2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                </span>
                              )}
                              <span>{col.name}</span>
                            </td>
                            <td className="py-2 px-3 text-slate-600 font-normal">
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px]">
                                {col.type}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-500 font-sans text-[11px]">
                              {col.isPrimary ? (
                                <span className="text-amber-700 font-medium">PRIMARY KEY</span>
                              ) : col.isForeign ? (
                                <span className="text-blue-700 font-medium">FK &rarr; {col.foreignTable}</span>
                              ) : col.nullable ? (
                                <span className="text-slate-400">NULL</span>
                              ) : (
                                <span className="text-slate-600 font-medium">NOT NULL</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-600 font-sans text-xs">
                              {col.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* RLS Policies attached to this table */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Row Level Security (RLS) Policies on {table.name}</span>
                    </div>
                    <div className="space-y-2">
                      {table.rlsPolicies.map((pol) => (
                        <div key={pol.name} className="bg-white p-2.5 rounded border border-slate-200 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono font-bold text-slate-900">{pol.name}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded uppercase">
                                {pol.action}
                              </span>
                              <div className="flex gap-1">
                                {pol.rolesAllowed.map((r) => (
                                  <span key={r} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded border border-emerald-200 capitalize">
                                    {r}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-1.5 font-mono text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded">
                            {pol.rule}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
