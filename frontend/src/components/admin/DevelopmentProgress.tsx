import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  TrendingUp,
  Users,
  Code,
  Zap,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { allPhases, getProjectStats, DevelopmentPhase, PhaseFeature } from '../../utils/developmentPhases';

const DevelopmentProgress: React.FC = () => {
  const [expandedPhases, setExpandedPhases] = useState<string[]>(['phase-4']);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'phases' | 'features'>('overview');
  
  const stats = getProjectStats();

  const togglePhaseExpansion = (phaseId: string) => {
    setExpandedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'testing':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-secondary-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-secondary-100 text-secondary-800 border-secondary-200';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-university-50 rounded-xl p-6 border border-university-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-university-600">Completion</p>
              <p className="text-2xl font-bold text-university-900">{stats.completionPercentage}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-university-600" />
          </div>
          <div className="mt-3 w-full bg-university-200 rounded-full h-2">
            <div 
              className="bg-university-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Phases Done</p>
              <p className="text-2xl font-bold text-green-900">{stats.completedPhases}/{stats.totalPhases}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Features</p>
              <p className="text-2xl font-bold text-blue-900">{stats.completedFeatures}/{stats.totalFeatures}</p>
            </div>
            <Code className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Efficiency</p>
              <p className="text-2xl font-bold text-purple-900">{stats.efficiencyRatio}%</p>
            </div>
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Time Statistics */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Development Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-900">{stats.estimatedHours}h</div>
            <div className="text-sm text-secondary-600">Estimated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-900">{stats.actualHours}h</div>
            <div className="text-sm text-secondary-600">Actual</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-900">+{stats.actualHours - stats.estimatedHours}h</div>
            <div className="text-sm text-secondary-600">Variance</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhases = () => (
    <div className="space-y-4">
      {allPhases.map((phase) => (
        <div key={phase.id} className="bg-white rounded-xl shadow-card border border-secondary-200">
          <div 
            className="p-6 cursor-pointer hover:bg-secondary-50 transition-colors duration-200"
            onClick={() => togglePhaseExpansion(phase.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {expandedPhases.includes(phase.id) ? (
                  <ChevronDown className="w-5 h-5 text-secondary-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-secondary-400" />
                )}
                {getStatusIcon(phase.status)}
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">{phase.name}</h3>
                  <p className="text-sm text-secondary-600">{phase.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-secondary-900">{phase.completionPercentage}%</div>
                  <div className="text-xs text-secondary-500">{phase.features.length} features</div>
                </div>
                <div className="w-16 h-2 bg-secondary-200 rounded-full">
                  <div 
                    className="h-2 bg-university-600 rounded-full transition-all duration-500"
                    style={{ width: `${phase.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {expandedPhases.includes(phase.id) && (
            <div className="px-6 pb-6 border-t border-secondary-100">
              <div className="pt-4 space-y-3">
                {phase.features.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(feature.status)}
                      <div>
                        <div className="font-medium text-secondary-900">{feature.name}</div>
                        <div className="text-sm text-secondary-600">{feature.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {feature.completedAt && (
                        <div className="text-xs text-secondary-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {feature.completedAt}
                        </div>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(feature.status)}`}>
                        {feature.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderFeatures = () => {
    const allFeatures = allPhases.flatMap(phase => 
      phase.features.map(feature => ({ ...feature, phaseName: phase.name }))
    );

    return (
      <div className="bg-white rounded-xl shadow-card">
        <div className="p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900">All Features</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-secondary-700">Feature</th>
                <th className="text-left p-4 text-sm font-medium text-secondary-700">Phase</th>
                <th className="text-left p-4 text-sm font-medium text-secondary-700">Status</th>
                <th className="text-left p-4 text-sm font-medium text-secondary-700">Hours</th>
                <th className="text-left p-4 text-sm font-medium text-secondary-700">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {allFeatures.map((feature) => (
                <tr key={feature.id} className="hover:bg-secondary-50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-secondary-900">{feature.name}</div>
                      <div className="text-sm text-secondary-600">{feature.description}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-secondary-600">{feature.phaseName}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(feature.status)}`}>
                      {feature.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-secondary-600">
                    {feature.actualHours || feature.estimatedHours || '-'}h
                  </td>
                  <td className="p-4 text-sm text-secondary-600">
                    {feature.completedAt || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Development Progress</h1>
        <p className="text-secondary-600">Track the development phases and feature completion for Fretio</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-secondary-100 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'phases', label: 'Phases', icon: Calendar },
          { id: 'features', label: 'Features', icon: Code }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              selectedTab === tab.id
                ? 'bg-white text-university-700 shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && renderOverview()}
      {selectedTab === 'phases' && renderPhases()}
      {selectedTab === 'features' && renderFeatures()}
    </div>
  );
};

export default DevelopmentProgress; 