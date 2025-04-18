import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { getAppConfig, AppConfig, MapProvider } from '@/config/appConfig';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save } from 'lucide-react';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const currentConfig = await getAppConfig();
        setConfig(currentConfig);
      } catch (error) {
        console.error('Error loading config:', error);
        toast({
          title: 'Error',
          description: 'Failed to load application settings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [toast]);

  const handleChange = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    if (!config) return;
    setConfig({
      ...config,
      [key]: value,
    });
  };

  const handleMapProviderChange = (provider: MapProvider) => {
    handleChange('mapProvider', provider);
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      // Convert our config object to the database format
      const dbConfig = {
        map_provider: config.mapProvider,
        google_maps_api_key: config.googleMapsApiKey,
        smsalert_api_key: config.smsAlertApiKey,
        smsalert_sender_id: config.smsAlertSenderId,
      };
      
      // Check if config exists using the get_app_config RPC first to get the ID
      const { data: configData } = await (supabase.rpc as any)('get_app_config');
      const hasExistingConfig = configData && Object.keys(configData).length > 0;
      
      let result;
      if (hasExistingConfig) {
        // Update existing config using RPC call
        result = await (supabase.rpc as any)('update_app_config', {
          p_map_provider: dbConfig.map_provider,
          p_google_maps_api_key: dbConfig.google_maps_api_key,
          p_smsalert_api_key: dbConfig.smsalert_api_key,
          p_smsalert_sender_id: dbConfig.smsalert_sender_id
        });
      } else {
        // Insert new config using RPC call
        result = await (supabase.rpc as any)('insert_app_config', {
          p_map_provider: dbConfig.map_provider,
          p_google_maps_api_key: dbConfig.google_maps_api_key,
          p_smsalert_api_key: dbConfig.smsalert_api_key,
          p_smsalert_sender_id: dbConfig.smsalert_sender_id
        });
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: 'Settings Saved',
        description: 'Your application settings have been updated',
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error',
        description: 'Failed to save application settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
          
          <Tabs defaultValue="maps">
            <TabsList className="mb-6">
              <TabsTrigger value="maps">Map Services</TabsTrigger>
              <TabsTrigger value="sms">SMS Verification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="maps">
              <Card>
                <CardHeader>
                  <CardTitle>Map Configuration</CardTitle>
                  <CardDescription>
                    Choose which map provider to use for location services throughout the application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Map Provider</Label>
                      <RadioGroup 
                        value={config?.mapProvider} 
                        onValueChange={(value) => handleMapProviderChange(value as MapProvider)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="openstreetmap" id="openstreetmap" />
                          <Label htmlFor="openstreetmap">OpenStreetMap (Free)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="google" id="google" />
                          <Label htmlFor="google">Google Maps (API Key Required)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {config?.mapProvider === 'google' && (
                      <div className="space-y-2">
                        <Label htmlFor="googleMapsApiKey">Google Maps API Key</Label>
                        <Input
                          id="googleMapsApiKey"
                          value={config.googleMapsApiKey}
                          onChange={(e) => handleChange('googleMapsApiKey', e.target.value)}
                          placeholder="Enter your Google Maps API Key"
                        />
                        <p className="text-xs text-muted-foreground">
                          You can obtain a Google Maps API key from the <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a>
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sms">
              <Card>
                <CardHeader>
                  <CardTitle>SMS Verification Settings</CardTitle>
                  <CardDescription>
                    Configure SMSAlert service for phone number verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="smsAlertApiKey">SMSAlert API Key</Label>
                      <Input
                        id="smsAlertApiKey"
                        value={config?.smsAlertApiKey || ''}
                        onChange={(e) => handleChange('smsAlertApiKey', e.target.value)}
                        placeholder="Enter your SMSAlert API Key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smsAlertSenderId">SMSAlert Sender ID</Label>
                      <Input
                        id="smsAlertSenderId"
                        value={config?.smsAlertSenderId || ''}
                        onChange={(e) => handleChange('smsAlertSenderId', e.target.value)}
                        placeholder="Enter your SMSAlert Sender ID (e.g., SALONAPP)"
                        maxLength={6}
                      />
                      <p className="text-xs text-muted-foreground">
                        Sender ID should be 6 characters long. This ID will appear as the sender of SMS messages.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSaveConfig}
              disabled={saving}
              className="bg-salon-primary hover:bg-salon-secondary"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSettings;
