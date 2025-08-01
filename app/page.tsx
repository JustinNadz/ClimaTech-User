'use client'

declare global {
  interface Window {
    google: typeof google
  }
}

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, MapPin, User, LogOut, MessageSquare, FileText, Bell, Cloud, Droplets, Wind, Eye, Sun, AlertTriangle, Loader2, Layers, Satellite, Settings, Phone, Mail, Calendar, Clock } from 'lucide-react'
import { Loader } from '@googlemaps/js-api-loader'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  location?: { lat: number; lng: number; name: string }
}

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  visibility: number
  condition: string
  uvIndex: number
  pressure: number
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'weather' | 'alert' | 'system'
  timestamp: Date
  read: boolean
}

export default function Component() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m ClimaTech AI, your weather assistant for the Philippines. I can provide real-time weather updates, forecasts, and climate information. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [mapView, setMapView] = useState<'satellite' | 'terrain' | 'weather'>('weather')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [reportType, setReportType] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Weather Alert',
      message: 'Heavy rainfall expected in Metro Manila area. Stay safe and avoid flood-prone areas.',
      type: 'alert',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      title: 'System Update',
      message: 'ClimaTech AI has been updated with improved weather prediction algorithms.',
      type: 'system',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    }
  ])
  const [mounted, setMounted] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const saveMessagesToStorage = (messages: Message[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('climatech-messages', JSON.stringify(messages))
    }
  }

  const loadMessagesFromStorage = (): Message[] => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('climatech-messages')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          return parsed.map((msg: { id: string; type: 'user' | 'bot'; content: string; timestamp: string; location?: { lat: number; lng: number; name: string } }) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        } catch (error) {
          console.error('Error loading messages from storage:', error)
        }
      }
    }
    return [
      {
        id: '1',
        type: 'bot',
        content: 'Hello! I\'m ClimaTech AI, your weather assistant for the Philippines. I can provide real-time weather updates, forecasts, and climate information. How can I help you today?',
        timestamp: new Date()
      }
    ]
  }

  useEffect(() => {
    setMounted(true)
    const savedMessages = loadMessagesFromStorage()
    setMessages(savedMessages)
  }, [])

  useEffect(() => {
    if (mounted && mapRef.current && !mapLoaded) {
      const loader = new Loader({
        apiKey: 'AIzaSyDs1jPthO5glpp9gJ3d5ahKoRsHxrc2g7Q',
        version: 'weekly',
        libraries: ['places']
      })

      loader.load().then(() => {
        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: 12.8797, lng: 121.7740 }, // Philippines center
            zoom: 6,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#193341' }]
              },
              {
                featureType: 'landscape',
                elementType: 'geometry',
                stylers: [{ color: '#2c5a71' }]
              }
            ]
          })
          setMap(mapInstance)
          setMapLoaded(true)
        }
      })
    }
  }, [mounted, mapLoaded])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (map && userLocation) {
      const position = { lat: userLocation.lat, lng: userLocation.lng }
      map.setCenter(position)
      map.setZoom(12)
      
      // Add user location marker
      new google.maps.Marker({
        position,
        map,
        title: userLocation.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#ef4444" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24)
        }
      })
    }
  }, [map, userLocation])

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      addBotMessage('Geolocation is not supported by this browser.')
      return
    }

    setIsLoading(true)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        // Simulate reverse geocoding for Philippines location
        const locationName = getPhilippinesLocationName(latitude, longitude)
        const location = { lat: latitude, lng: longitude, name: locationName }
        
        setUserLocation(location)
        setLocationPermission('granted')
        
        // Simulate weather data fetch
        const weather = await fetchWeatherData()
        setWeatherData(weather)
        
        addBotMessage(`Great! I've located you in ${locationName}. Here's your current weather:

🌡️ Temperature: ${weather.temperature}°C
💧 Humidity: ${weather.humidity}%
💨 Wind Speed: ${weather.windSpeed} km/h
👁️ Visibility: ${weather.visibility} km
☀️ UV Index: ${weather.uvIndex}
🌤️ Condition: ${weather.condition}

The map has been updated to show your location. What would you like to know about the weather?`)
        
        setIsLoading(false)
      },
      () => {
        setLocationPermission('denied')
        setIsLoading(false)
        addBotMessage('Location access denied. I can still provide general weather information for the Philippines. Please specify a city or region.')
      }
    )
  }

  const getPhilippinesLocationName = (lat: number, lng: number): string => {
    // Determine location based on coordinates
    // Butuan City coordinates: approximately 8.9495° N, 125.5406° E
    const butuanLat = 8.9495
    const butuanLng = 125.5406
    
    // Check if coordinates are near Butuan City (within ~50km radius)
    const latDiff = Math.abs(lat - butuanLat)
    const lngDiff = Math.abs(lng - butuanLng)
    
    if (latDiff < 0.5 && lngDiff < 0.5) {
      return 'Butuan City, Agusan del Norte'
    }
    
    // Fallback to other major cities if not near Butuan
    const locations = [
      'Manila, Metro Manila',
      'Cebu City, Cebu',
      'Davao City, Davao del Sur',
      'Quezon City, Metro Manila',
      'Makati City, Metro Manila',
      'Baguio City, Benguet',
      'Iloilo City, Iloilo',
      'Cagayan de Oro, Misamis Oriental'
    ]
    return locations[Math.floor(Math.random() * locations.length)]
  }

  const fetchWeatherData = async (): Promise<WeatherData> => {
    // Simulate API call with realistic Philippines weather data
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      temperature: Math.round(25 + Math.random() * 10),
      humidity: Math.round(60 + Math.random() * 30),
      windSpeed: Math.round(5 + Math.random() * 15),
      visibility: Math.round(8 + Math.random() * 7),
      condition: ['Partly Cloudy', 'Sunny', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
      uvIndex: Math.round(3 + Math.random() * 8),
      pressure: Math.round(1010 + Math.random() * 20)
    }
  }

  const addBotMessage = (content: string, location?: { lat: number; lng: number; name: string }) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date(),
      location
    }
    setMessages(prev => {
      const updatedMessages = [...prev, newMessage]
      saveMessagesToStorage(updatedMessages)
      return updatedMessages
    })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => {
      const updatedMessages = [...prev, userMessage]
      saveMessagesToStorage(updatedMessages)
      return updatedMessages
    })
    setInputMessage('')
    setIsLoading(true)

    // Check if user is asking about weather and needs location
    const weatherKeywords = ['weather', 'temperature', 'rain', 'forecast', 'climate', 'humid']
    const needsLocation = weatherKeywords.some(keyword => 
      inputMessage.toLowerCase().includes(keyword)
    )

    if (needsLocation && !userLocation && locationPermission === 'prompt') {
      setTimeout(() => {
        addBotMessage('To provide accurate weather information for your area, I need access to your location. Would you like me to request location permission?')
        setIsLoading(false)
      }, 1000)
      return
    }

    // Simulate AI response
    setTimeout(() => {
      let response = ''
      
      if (inputMessage.toLowerCase().includes('weather')) {
        if (userLocation && weatherData) {
          response = `Current weather in ${userLocation.name}:
🌡️ ${weatherData.temperature}°C - ${weatherData.condition}
💧 Humidity: ${weatherData.humidity}%
💨 Wind: ${weatherData.windSpeed} km/h
Pressure: ${weatherData.pressure} hPa

Would you like a detailed forecast or information about other areas?`
        } else {
          response = 'I can provide weather information for any location in the Philippines. Please specify a city or allow location access for personalized updates.'
        }
      } else if (inputMessage.toLowerCase().includes('philippines')) {
        response = 'The Philippines has a tropical maritime climate with three main seasons: dry (December-May), wet (June-November), and cool dry (December-February). The country experiences monsoons and is prone to typhoons. What specific information would you like about Philippine weather patterns?'
      } else if (inputMessage.toLowerCase().includes('forecast')) {
        response = 'Here\'s the 3-day forecast for your area:\n\n🌅 Tomorrow: 28°C, Partly cloudy, 20% rain\n🌤️ Day 2: 30°C, Sunny, 10% rain\n⛅ Day 3: 26°C, Cloudy, 60% rain\n\nWould you like more detailed information for any specific day?'
      } else {
        response = 'I\'m here to help with weather and climate information for the Philippines. You can ask me about current conditions, forecasts, typhoon updates, or general climate patterns. How can I assist you?'
      }
      
      addBotMessage(response)
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const handleSendFeedback = () => {
    if (feedbackText.trim()) {
      // Simulate sending feedback
      alert('Thank you for your feedback! We appreciate your input and will use it to improve ClimaTech AI.')
      setFeedbackText('')
      setShowFeedback(false)
    }
  }

  const handleSubmitReport = () => {
    if (reportType && reportDescription.trim()) {
      // Simulate submitting report
      alert(`Report submitted successfully! Report Type: ${reportType}. We will investigate this issue and get back to you soon.`)
      setReportType('')
      setReportDescription('')
      setShowReport(false)
    }
  }

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      // Simulate sign out
      alert('You have been signed out successfully. Thank you for using ClimaTech AI!')
      // In a real app, this would redirect to login page
    }
  }

  const loadConversationFromHistory = (selectedMessages: Message[]) => {
    setMessages(selectedMessages)
    setShowHistory(false)
    // Scroll to bottom after loading conversation
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-xl px-6 py-4 border-b-2 border-blue-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-yellow-300">
              <span className="text-blue-800 font-bold text-2xl">C</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">ClimaTech AI</h1>
              <p className="text-blue-100 text-sm font-medium">Weather Intelligence Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="relative text-white hover:bg-blue-600 rounded-full p-2 transition-all duration-200 hover:scale-110">
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-2 border-white animate-pulse">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <Bell className="mr-2 h-5 w-5 text-blue-600" />
                    Notifications
                  </DialogTitle>
                  <DialogDescription>
                    Stay updated with weather alerts and system notifications
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-96">
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          notification.read 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-blue-50 border-blue-200'
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              {notification.type === 'alert' && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                              {notification.type === 'weather' && (
                                <Cloud className="h-4 w-4 text-blue-500" />
                              )}
                              {notification.type === 'system' && (
                                <Settings className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <div className="flex items-center text-xs text-gray-400 mt-2">
                              <Clock className="h-3 w-3 mr-1" />
                              {notification.timestamp.toLocaleString()}
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:bg-blue-600 transition-all duration-200 hover:scale-110">
                  <Avatar className="h-12 w-12 border-3 border-yellow-400 shadow-lg">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" alt="User" />
                    <AvatarFallback className="bg-yellow-400 text-blue-800 font-bold text-lg">U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="hover:bg-blue-50" onClick={() => setShowProfile(true)}>
                  <User className="mr-2 h-4 w-4 text-blue-600" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-yellow-50" onClick={() => setShowFeedback(true)}>
                  <MessageSquare className="mr-2 h-4 w-4 text-yellow-600" />
                  <span>Send Feedback</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-red-50" onClick={() => setShowReport(true)}>
                  <FileText className="mr-2 h-4 w-4 text-red-600" />
                  <span>File a Report</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-green-50" onClick={() => setShowHistory(true)}>
                  <Clock className="mr-2 h-4 w-4 text-green-600" />
                  <span>History</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-purple-50" onClick={() => setShowFAQ(true)}>
                  <MessageSquare className="mr-2 h-4 w-4 text-purple-600" />
                  <span>FAQ</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-red-50" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4 text-red-600" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              User Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-blue-200">
                <AvatarImage src="/placeholder.svg?height=64&width=64" alt="User" />
                <AvatarFallback className="bg-blue-600 text-white font-bold text-xl">U</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">John Doe</h3>
                <p className="text-sm text-gray-600">Premium User</p>
                <p className="text-xs text-gray-500">Member since January 2024</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">john.doe@email.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">+63 912 345 6789</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Manila, Philippines</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Last login: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Edit Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-yellow-600" />
              Send Feedback
            </DialogTitle>
            <DialogDescription>
              Help us improve ClimaTech AI by sharing your thoughts and suggestions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Tell us what you think about ClimaTech AI, report bugs, or suggest new features..."
                value={feedbackText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedbackText(e.target.value)}
                className="mt-2 min-h-32"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleSendFeedback}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600"
                disabled={!feedbackText.trim()}
              >
                Send Feedback
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowFeedback(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-red-600" />
              File a Report
            </DialogTitle>
            <DialogDescription>
              Report technical issues, data inaccuracies, or other problems
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="data">Data Inaccuracy</SelectItem>
                  <SelectItem value="ui">User Interface Problem</SelectItem>
                  <SelectItem value="performance">Performance Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                placeholder="Please describe the issue in detail..."
                value={reportDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReportDescription(e.target.value)}
                className="mt-2 min-h-32"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleSubmitReport}
                className="flex-1 bg-red-500 hover:bg-red-600"
                disabled={!reportType || !reportDescription.trim()}
              >
                Submit Report
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowReport(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-green-600" />
              Chat History
            </DialogTitle>
            <DialogDescription>
              View your previous weather conversations and queries
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.length > 1 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">Recent Conversations</h4>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => loadConversationFromHistory(messages)}
                    className="text-xs"
                  >
                    Load Full Chat
                  </Button>
                </div>
                {messages.slice(1).map((message, index) => (
                  <div 
                    key={index} 
                    className="border rounded-lg p-4 bg-gray-50 hover:bg-blue-50 cursor-pointer transition-all duration-200 hover:shadow-md"
                    onClick={() => {
                      // Load conversation up to this message
                      const conversationUpToHere = messages.slice(0, index + 2) // +2 because we skipped the first message and want to include this one
                      loadConversationFromHistory(conversationUpToHere)
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        message.type === 'user' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {message.type === 'user' ? 'You' : 'ClimaTech AI'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{message.content}</p>
                    <div className="mt-2 text-xs text-blue-600 font-medium">
                      Click to load this conversation →
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No chat history yet. Start a conversation to see your history here.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={showFAQ} onOpenChange={setShowFAQ}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-purple-600" />
              Frequently Asked Questions
            </DialogTitle>
            <DialogDescription>
              Common questions about ClimaTech AI and weather information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">How accurate is the weather data?</h4>
                <p className="text-sm text-gray-700">Our weather data is sourced from reliable meteorological services and provides real-time updates for the Philippines. Accuracy is typically within 2-3°C for temperature and 85-90% for precipitation forecasts.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Can I get weather alerts?</h4>
                <p className="text-sm text-gray-700">Yes! Enable location access to receive personalized weather alerts for your area, including typhoon warnings, heavy rainfall alerts, and extreme weather conditions.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">How do I change my location?</h4>
                <p className="text-sm text-gray-700">Click the location button in the map controls or simply ask me about weather in a specific city. You can also manually specify any location in the Philippines.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">What weather information is available?</h4>
                <p className="text-sm text-gray-700">We provide current conditions, temperature, humidity, wind speed, visibility, UV index, pressure, and detailed forecasts. You can also ask about typhoon updates and climate patterns.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Is my location data secure?</h4>
                <p className="text-sm text-gray-700">Yes, your location data is only used to provide weather information and is not stored or shared. We prioritize your privacy and data security.</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Left Panel - Chatbot */}
      <div className="w-2/5 flex flex-col pt-20 border-r-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-b-2 border-blue-300 shadow-lg">
          <h2 className="text-xl font-bold flex items-center">
            <MessageSquare className="mr-3 h-6 w-6 text-yellow-300" />
            Weather Assistant
          </h2>
          <p className="text-blue-100 mt-2 font-medium">Ask me about weather conditions in the Philippines</p>
        </div>

        {/* Location Permission Alert */}
        {locationPermission === 'prompt' && (
          <div className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b-2 border-yellow-200">
            <Alert className="border-yellow-400 bg-yellow-50 shadow-lg">
              <MapPin className="h-5 w-5 text-yellow-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-yellow-800">Enable location for personalized weather updates</span>
                  <Button 
                    size="sm" 
                    onClick={requestLocation} 
                    disabled={isLoading}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Allow Location'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="space-y-6 p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-lg transition-all duration-200 hover:shadow-xl ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : 'bg-white border-2 border-blue-200 text-gray-900 shadow-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 opacity-70 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-blue-500'
                  }`}>
                    {mounted ? message.timestamp.toLocaleTimeString() : ''}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-blue-200 rounded-2xl px-6 py-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">ClimaTech AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-blue-200 shadow-lg">
          <div className="flex space-x-3">
            <Input
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about weather conditions..."
              className="flex-1 border-2 border-blue-200 focus:border-blue-400 rounded-xl text-sm"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl px-6 transition-all duration-200 hover:scale-105"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Full Map */}
      <div className="w-3/5 flex flex-col pt-20 bg-gradient-to-br from-blue-50 to-white">
        {/* Map Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg border-b-2 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center">
                <MapPin className="mr-3 h-6 w-6 text-yellow-300" />
                Philippines Weather Map
              </h2>
              <p className="text-blue-100 text-sm mt-2 font-medium">Real-time weather visualization</p>
            </div>
            
            {/* Map Controls */}
            <div className="flex items-center space-x-3">
              <Button 
                size="sm" 
                variant={mapView === 'weather' ? 'secondary' : 'ghost'}
                onClick={() => {
                  setMapView('weather')
                  if (map) map.setMapTypeId(google.maps.MapTypeId.ROADMAP)
                }}
                className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 hover:scale-105 ${
                  mapView === 'weather' 
                    ? 'bg-yellow-400 text-blue-800 hover:bg-yellow-500 shadow-lg' 
                    : 'text-white hover:bg-blue-600'
                }`}
              >
                <Cloud className="h-5 w-5 mr-2" />
                Weather
              </Button>
              <Button 
                size="sm" 
                variant={mapView === 'satellite' ? 'secondary' : 'ghost'}
                onClick={() => {
                  setMapView('satellite')
                  if (map) map.setMapTypeId(google.maps.MapTypeId.SATELLITE)
                }}
                className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 hover:scale-105 ${
                  mapView === 'satellite' 
                    ? 'bg-yellow-400 text-blue-800 hover:bg-yellow-500 shadow-lg' 
                    : 'text-white hover:bg-blue-600'
                }`}
              >
                <Satellite className="h-5 w-5 mr-2" />
                Satellite
              </Button>
              <Button 
                size="sm" 
                variant={mapView === 'terrain' ? 'secondary' : 'ghost'}
                onClick={() => {
                  setMapView('terrain')
                  if (map) map.setMapTypeId(google.maps.MapTypeId.TERRAIN)
                }}
                className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 hover:scale-105 ${
                  mapView === 'terrain' 
                    ? 'bg-yellow-400 text-blue-800 hover:bg-yellow-500 shadow-lg' 
                    : 'text-white hover:bg-blue-600'
                }`}
              >
                <Layers className="h-5 w-5 mr-2" />
                Terrain
              </Button>
            </div>
          </div>
        </div>

        {/* Full Map Container */}
        <div className="flex-1 relative bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 overflow-hidden rounded-lg m-4 shadow-2xl">
          {/* Google Maps Container */}
          <div ref={mapRef} className="w-full h-full rounded-lg" />
          
          {/* Loading Overlay */}
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-600 bg-opacity-90 rounded-lg">
              <div className="flex items-center space-x-3 text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-lg font-medium">Loading Google Maps...</span>
              </div>
            </div>
          )}

          {/* Enhanced Weather Info Panel */}
          {weatherData && userLocation && (
            <div className="absolute top-6 right-6 w-80">
              <Card className="bg-white/95 backdrop-blur-sm border-2 border-blue-200 shadow-2xl rounded-2xl">
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-yellow-300" />
                    {userLocation.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-bold text-blue-800">{weatherData.temperature}°C</span>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-800 font-semibold px-3 py-1 rounded-full">
                      {weatherData.condition}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center p-3 bg-blue-50 rounded-xl shadow-sm">
                      <Droplets className="h-5 w-5 mr-3 text-blue-600" />
                      <span className="text-blue-800 font-semibold">{weatherData.humidity}%</span>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-xl shadow-sm">
                      <Wind className="h-5 w-5 mr-3 text-blue-600" />
                      <span className="text-blue-800 font-semibold">{weatherData.windSpeed} km/h</span>
                    </div>
                    <div className="flex items-center p-3 bg-yellow-50 rounded-xl shadow-sm">
                      <Eye className="h-5 w-5 mr-3 text-yellow-600" />
                      <span className="text-yellow-800 font-semibold">{weatherData.visibility} km</span>
                    </div>
                    <div className="flex items-center p-3 bg-yellow-50 rounded-xl shadow-sm">
                      <Sun className="h-5 w-5 mr-3 text-yellow-600" />
                      <span className="text-yellow-800 font-semibold">UV {weatherData.uvIndex}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-blue-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600 font-medium">Pressure:</span>
                      <span className="font-bold text-blue-800">{weatherData.pressure} hPa</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}




        </div>
      </div>
    </div>
  )
}