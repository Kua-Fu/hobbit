package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type FormatRequest struct {
	Input string `json:"input" binding:"required"`
}

func FormatHandler(c *gin.Context) {
	var req FormatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	input := strings.TrimSpace(req.Input)
	var result interface{}

	// If the input is empty
	if input == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Empty input"})
		return
	}

	// Try to unmarshal directly
	err := json.Unmarshal([]byte(input), &result)
	if err != nil {
		// If it's not valid JSON, maybe it's missing quotes if it was intended as a string?
		// But the user said "possibly json serialized after string", so it's likely already quoted or escaped.
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON: " + err.Error()})
		return
	}

	// Parse recursively if fields are strings that look like JSON
	result = recursiveParse(result)

	c.JSON(http.StatusOK, gin.H{
		"data": result,
	})
}

func recursiveParse(v interface{}) interface{} {
	switch val := v.(type) {
	case string:
		var next interface{}
		if err := json.Unmarshal([]byte(val), &next); err == nil {
			return recursiveParse(next)
		}
		return val
	case map[string]interface{}:
		newMap := make(map[string]interface{})
		for k, v := range val {
			newMap[k] = recursiveParse(v)
		}
		return newMap
	case []interface{}:
		newSlice := make([]interface{}, len(val))
		for i, v := range val {
			newSlice[i] = recursiveParse(v)
		}
		return newSlice
	default:
		return v
	}
}
